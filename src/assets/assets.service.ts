import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';


@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAssetDto) {
    try {
      // Log entrada para depuración
      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.create] payload:', JSON.stringify(data));
      }

      // Normalizar posibles campos de fecha que vienen como strings desde el frontend
      const payload: any = { ...data };
      const dateFields = ['purchaseDate', 'deliveryDate', 'receivedDate'];
      for (const f of dateFields) {
        if (payload[f]) {
          const d = new Date(payload[f]);
          // Si la fecha no es válida, dejamos que Prisma/handler lance el error,
          // pero convertimos cadenas válidas a objetos Date para que Prisma acepte el valor.
          if (!isNaN(d.getTime())) payload[f] = d;
        }
      }

      return await this.prisma.asset.create({ data: payload });
    } catch (error) {
      // Always log the error (helps debugging when DEBUG flag isn't set)
      console.error('[AssetsService.create] caught error:', error && error.stack ? error.stack : error);

      // Delegate to the Prisma error handler which will throw an HTTP exception
      handlePrismaError(error, 'Activo');
    }
  }

  // Obtener activos con soporte de búsqueda y paginación
  async findAll(q?: string, page = 1, limit = 10) {
    const where: any = {};

    if (q && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { assetCode: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { serialNumber: { contains: term, mode: 'insensitive' } },
      ];
    }

    const take = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (Number(page) > 1 ? Number(page) - 1 : 0) * take;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({ 
        where, 
        skip, 
        take,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      this.prisma.asset.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / take));

    return {
      data,
      total,
      page: Number(page),
      limit: take,
      totalPages,
    };
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    return asset;
  }

  async update(id: number, data: UpdateAssetDto) {
    try {
      // Log entrada para depuración
      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.update] id, payload:', id, JSON.stringify(data));
      }

      // Obtener el activo actual para validar reglas de negocio
      const existingAsset = await this.prisma.asset.findUnique({ where: { id } });
      if (!existingAsset) throw new NotFoundException(`Activo con ID ${id} no encontrado`);

      // Si el activo está asignado, no permitir cambiar el estado ni la fecha de recepción
      const isAssigned = existingAsset.status === 'assigned' || !!existingAsset.assignedPersonId;
      if (isAssigned) {
        // Si el cliente intenta modificar el estado o la fecha de recepción
        if ((data.status !== undefined && data.status !== existingAsset.status) || (data.receivedDate !== undefined && data.receivedDate !== null)) {
          throw new BadRequestException('No puedes editar este dispositivo hasta que no tenga una asignación activa');
        }
      }

      // Normalizar posibles campos de fecha que vienen como strings desde el frontend
      const payload: any = { ...data };
      const dateFields = ['purchaseDate', 'deliveryDate', 'receivedDate'];
      for (const f of dateFields) {
        if (payload[f]) {
          const d = new Date(payload[f]);
          if (!isNaN(d.getTime())) payload[f] = d;
        }
      }

      // Construir objeto limpio para evitar enviar propiedades undefined/''
      const updateData: any = {};
      for (const key of Object.keys(payload)) {
        const val = payload[key];
        if (val === undefined) continue;
        // Evitar enviar cadenas vacías que puedan sobrescribir valores existentes
        if (typeof val === 'string' && val.trim() === '') continue;
        updateData[key] = val;
      }

      // Si el activo está asignado, asegurar que no podamos modificar campos
      // críticos que llevarían a dejarlo en disponible accidentalmente.
      if (isAssigned) {
        if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
          console.log('[AssetsService.update] activo asignado - impidiendo cambios en status/receivedDate/assignedPersonId');
          console.log('[AssetsService.update] payload antes de limpiar:', payload);
          console.log('[AssetsService.update] updateData antes de borrar campos:', updateData);
        }
        delete updateData.status;
        delete updateData.receivedDate;
        // Evitar quitar la referencia a la persona asignada desde un update
        // genérico de activo (se gestiona desde AssignmentHistory)
        delete updateData.assignedPersonId;
        if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
          console.log('[AssetsService.update] updateData después de borrar campos:', updateData);
        }
      }

      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.update] Ejecutando prisma.asset.update con:', updateData);
      }
      return await this.prisma.asset.update({ where: { id }, data: updateData });
    } catch (error) {
      // Log the error to help debugging
      console.error('[AssetsService.update] caught error:', error && error.stack ? error.stack : error);
      handlePrismaError(error, 'Activo', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.asset.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Activo', id);
    }
  }

  async findOneOwnedByUser(assetId: number, userId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, assignedPersonId: userId },
    });
    if (!asset) throw new NotFoundException('Activo no encontrado o no pertenece al usuario');
    return asset;
  }

  findAllByUser(userId: number) {
    return this.prisma.asset.findMany({
      where: { assignedPersonId: userId },
    });
  }

  async getAssetsGroupedByPerson() {
    const people = await this.prisma.person.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        departmentId: true,
        roleId: true,
        branchId: true,
        assets: {
          select: {
            id: true,
            assetCode: true,
            assetType: true,
            brand: true,
            model: true,
            status: true,
            serialNumber: true,
            purchaseDate: true,
            deliveryDate: true,
            receivedDate: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return people.map((p) => ({
      person: {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        username: p.username,
      },
      assets: p.assets,
      count: p.assets.length,
    }));
  }
}
