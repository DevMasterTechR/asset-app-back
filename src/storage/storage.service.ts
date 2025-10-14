import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStorageDto) {
    try {
      return await this.prisma.storageCapacity.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Capacidad de almacenamiento');
    }
  }

  async findAll() {
    return this.prisma.storageCapacity.findMany();
  }

  async findOne(id: number) {
    const storage = await this.prisma.storageCapacity.findUnique({ where: { id } });

    if (!storage) {
      throw new NotFoundException(`Capacidad de almacenamiento con ID ${id} no encontrada`);
    }

    return storage;
  }

  async update(id: number, dto: UpdateStorageDto) {
    try {
      return await this.prisma.storageCapacity.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Capacidad de almacenamiento', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.storageCapacity.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Capacidad de almacenamiento', id);
    }
  }
}
