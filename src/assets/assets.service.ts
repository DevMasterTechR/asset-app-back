import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';


@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Activo');
    }
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    return asset;
  }

  async update(id: number, data: UpdateAssetDto) {
    try {
      return await this.prisma.asset.update({ where: { id }, data });
    } catch (error) {
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
}
