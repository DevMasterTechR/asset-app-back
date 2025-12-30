import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLoanDto) {
    try {
      // Verificar que el activo exista y esté disponible
      const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new NotFoundException(`Activo con ID ${data.assetId} no encontrado`);

      // No permitir prestar si el activo está assigned, maintenance o decommissioned
      if (asset.status !== 'available') {
        throw new BadRequestException('El activo no está disponible para préstamo');
      }

      // Obtener persona para calcular sucursal por defecto y validar existencia
      const person = await this.prisma.person.findUnique({ where: { id: data.personId } });
      if (!person) throw new NotFoundException(`Persona con ID ${data.personId} no encontrada`);

      // Validar que loanDays sea positivo
      if (!data.loanDays || data.loanDays <= 0) {
        throw new BadRequestException('Los días de préstamo deben ser mayor que 0');
      }

      // Definir sucursal priorizando payload -> asset -> persona
      const resolvedBranchId =
        data.branchId !== undefined && data.branchId !== null
          ? data.branchId
          : asset.branchId ?? person.branchId ?? undefined;

      const loanData = { 
        ...data, 
        branchId: resolvedBranchId,
        loanDate: data.loanDate ? new Date(data.loanDate) : new Date(),
      };

      // Crear préstamo y actualizar estado del activo en una transacción
      const result = await this.prisma.$transaction([
        this.prisma.loan.create({
          data: loanData,
          include: { asset: true, person: true, branch: true },
        }),
        this.prisma.asset.update({
          where: { id: data.assetId },
          data: {
            status: 'loaned',
            assignedPersonId: data.personId,
            branchId: resolvedBranchId ?? asset.branchId,
            deliveryDate: data.loanDate ? new Date(data.loanDate) : new Date(),
            receivedDate: null,
          },
        }),
      ]);

      // Devolver tanto el préstamo creado (con relaciones) como el asset actualizado
      return { loan: result[0], asset: result[1] };
    } catch (error) {
      handlePrismaError(error, 'Préstamo');
    }
  }

  findAll() {
    return this.prisma.loan.findMany({
      include: { asset: true, person: true, branch: true },
      orderBy: { loanDate: 'desc' },
    });
  }

  async findByPersonId(personId: number) {
    return this.prisma.loan.findMany({
      where: { personId },
      include: { asset: true, person: true, branch: true },
      orderBy: { loanDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.loan.findUnique({
      where: { id },
      include: { asset: true, person: true, branch: true },
    });
    if (!record) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }
    return record;
  }

  async update(id: number, data: UpdateLoanDto) {
    try {
      const existing = await this.prisma.loan.findUnique({ where: { id }, include: { asset: true } });
      if (!existing) throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);

      // Si se registra devolución (returnDate o returnCondition), actualizar también el asset
      const shouldUpdateAsset = data.returnDate !== undefined || data.returnCondition !== undefined;

      if (shouldUpdateAsset) {
        // Si se registra una devolución, además de marcar el activo como
        // disponible debemos guardar la fecha de recepción en la tabla de assets.
        const receivedDate = data.returnDate ? new Date(data.returnDate) : new Date();

        const txResult = await this.prisma.$transaction([
          this.prisma.loan.update({ where: { id }, data }),
          this.prisma.asset.update({
            where: { id: existing.assetId },
            data: {
              status: 'available',
              assignedPersonId: null,
              receivedDate,
            },
          }),
        ]);

        // Devolver tanto el préstamo actualizado como el asset actualizado
        return { loan: txResult[0], asset: txResult[1] };
      }

      // Reasignación de dueño / actualización de sucursal sin devolución
      const targetPersonId = data.personId ?? existing.personId;
      const targetPerson = await this.prisma.person.findUnique({ where: { id: targetPersonId } });
      if (!targetPerson) throw new NotFoundException(`Persona con ID ${targetPersonId} no encontrada`);

      // Determinar sucursal final
      const resolvedBranchId =
        data.branchId !== undefined && data.branchId !== null
          ? data.branchId
          : existing.branchId ?? existing.asset?.branchId ?? targetPerson.branchId ?? undefined;

      const txResult = await this.prisma.$transaction([
        this.prisma.loan.update({
          where: { id },
          data: { ...data, personId: targetPersonId, branchId: resolvedBranchId },
        }),
        this.prisma.asset.update({
          where: { id: existing.assetId },
          data: {
            status: 'assigned',
            assignedPersonId: targetPersonId,
            branchId: resolvedBranchId ?? existing.asset.branchId,
          },
        }),
      ]);

      return { loan: txResult[0], asset: txResult[1] };
    } catch (error) {
      handlePrismaError(error, 'Préstamo', id);
    }
  }

  async remove(id: number) {
    try {
      // Antes de eliminar el préstamo, obtener el registro para conocer el assetId
      const existing = await this.prisma.loan.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);

      // Eliminar el préstamo y actualizar el asset relacionado en una transacción
      const tx = await this.prisma.$transaction([
        this.prisma.loan.delete({ where: { id } }),
        this.prisma.asset.update({
          where: { id: existing.assetId },
          data: {
            status: 'available',
            assignedPersonId: null,
            deliveryDate: null,
            receivedDate: null,
          },
        }),
      ]);

      // Devolver el préstamo eliminado y el asset actualizado
      return { loan: tx[0], asset: tx[1] };
    } catch (error) {
      handlePrismaError(error, 'Préstamo', id);
    }
  }
}
