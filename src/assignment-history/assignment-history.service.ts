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
      const result = await this.prisma.$transaction([
        this.prisma.assignmentHistory.create({ data }),
        this.prisma.asset.update({
          where: { id: data.assetId },
          data: {
            status: 'assigned',
            assignedPersonId: data.personId,
            branchId: data.branchId ?? asset.branchId,
          },
        }),
      ]);

      // Devolver tanto el assignmentHistory creado como el asset actualizado
      return { assignment: result[0], asset: result[1] };
    } catch (error) {
      handlePrismaError(error, 'Historial');
    }
  }

  findAll() {
    return this.prisma.assignmentHistory.findMany();
  }

  async findOne(id: number) {
    const record = await this.prisma.assignmentHistory.findUnique({ where: { id } });
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

        const txResult = await this.prisma.$transaction([
          this.prisma.assignmentHistory.update({ where: { id }, data }),
          this.prisma.asset.update({
            where: { id: existing.assetId },
            data: {
              status: 'available',
              assignedPersonId: null,
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
      return await this.prisma.assignmentHistory.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Historial', id);
    }
  }
}
