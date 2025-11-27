import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';

@Injectable()
export class AssignmentHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssignmentHistoryDto) {
    try {
      // Verificar que el activo exista y esté disponible
      const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new NotFoundException(`Activo con ID ${data.assetId} no encontrado`);

      // No permitir asignar si el activo está assigned, maintenance o decommissioned
      if (asset.status !== 'available') {
        throw new BadRequestException('El activo no está disponible para asignación');
      }

      // Crear historial y actualizar estado del activo en una transacción
      // Incluir relaciones en el assignment creado para que el frontend tenga
      // directamente la información del activo, persona y sucursal.
      const result = await this.prisma.$transaction([
        this.prisma.assignmentHistory.create({
          data,
          include: { asset: true, person: true, branch: true },
        }),
        this.prisma.asset.update({
          where: { id: data.assetId },
          data: {
            status: 'assigned',
            assignedPersonId: data.personId,
            branchId: data.branchId ?? asset.branchId,
            // Establecer la fecha de entrega en el asset cuando se crea la asignación
            deliveryDate: data.assignmentDate ? new Date(data.assignmentDate) : new Date(),
            // Al asignar, la fecha de recepción debe limpiarse (no recibido aún)
            receivedDate: null,
          },
        }),
      ]);

      // Devolver tanto el assignmentHistory creado (con relaciones) como el asset actualizado
      return { assignment: result[0], asset: result[1] };
    } catch (error) {
      handlePrismaError(error, 'Historial');
    }
  }

  findAll() {
    return this.prisma.assignmentHistory.findMany({
      include: { asset: true, person: true, branch: true },
      orderBy: { assignmentDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.assignmentHistory.findUnique({
      where: { id },
      include: { asset: true, person: true, branch: true },
    });
    if (!record) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }
    return record;
  }

  async update(id: number, data: UpdateAssignmentHistoryDto) {
    try {
      // Si se registra devolución (returnDate o returnCondition), actualizar también el asset
      const shouldUpdateAsset = data.returnDate !== undefined || data.returnCondition !== undefined;

      if (shouldUpdateAsset) {
        // Obtener historial actual para conocer el assetId
        const existing = await this.prisma.assignmentHistory.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Historial con ID ${id} no encontrado`);

        // Si se registra una devolución, además de marcar el activo como
        // disponible debemos guardar la fecha de recepción (`receivedDate`) en
        // la tabla de assets. Usamos la `returnDate` proporcionada por el
        // cliente si existe, o la fecha actual como fallback.
        const receivedDate = data.returnDate ? new Date(data.returnDate) : new Date();

        const txResult = await this.prisma.$transaction([
          this.prisma.assignmentHistory.update({ where: { id }, data }),
          this.prisma.asset.update({
            where: { id: existing.assetId },
            data: {
              status: 'available',
              assignedPersonId: null,
              receivedDate,
            },
          }),
        ]);

        // Devolver tanto el historial actualizado como el asset actualizado
        return { assignment: txResult[0], asset: txResult[1] };
      }

      return await this.prisma.assignmentHistory.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'Historial', id);
    }
  }

  async remove(id: number) {
    try {
      // Antes de eliminar el historial, obtener el registro para conocer el assetId
      const existing = await this.prisma.assignmentHistory.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Historial con ID ${id} no encontrado`);

      // Eliminar el historial y actualizar el asset relacionado en una transacción
      const tx = await this.prisma.$transaction([
        this.prisma.assignmentHistory.delete({ where: { id } }),
        this.prisma.asset.update({
          where: { id: existing.assetId },
          data: {
            // Al eliminar la asignación, dejar el activo en estado disponible
            status: 'available',
            // Quitar la referencia a la persona asignada
            assignedPersonId: null,
            // Limpiar fechas relacionadas con la asignación
            deliveryDate: null,
            receivedDate: null,
          },
        }),
      ]);

      // Devolver el historial eliminado (tx[0]) y el asset actualizado (tx[1])
      return { assignment: tx[0], asset: tx[1] };
    } catch (error) {
      handlePrismaError(error, 'Historial', id);
    }
  }
}
