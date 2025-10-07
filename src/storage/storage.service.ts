import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStorageDto) {
    return this.prisma.storageCapacity.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.storageCapacity.findMany();
  }

  async findOne(id: number) {
    const storage = await this.prisma.storageCapacity.findUnique({
      where: { id },
    });

    return storage; // el controlador se encarga de lanzar la excepción si es null
  }

  async update(id: number, dto: UpdateStorageDto) {
    try {
      return await this.prisma.storageCapacity.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      // Prisma lanza una excepción si no existe el recurso
      if (error.code === 'P2025') {
        return null; // el controlador lanza el NotFoundException
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.storageCapacity.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // el controlador lanza el NotFoundException
      }
      throw error;
    }
  }
}
