import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear almacenamiento
  async create(dto: CreateStorageDto) {
    try {
      return await this.prisma.storageCapacity.create({
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos
  async findAll() {
    return this.prisma.storageCapacity.findMany();
  }

  // Obtener por ID
  async findOne(id: number) {
    const storage = await this.prisma.storageCapacity.findUnique({
      where: { id },
    });

    if (!storage) {
      throw new NotFoundException(`Capacidad de almacenamiento con ID ${id} no encontrada`);
    }

    return storage;
  }

  // Actualizar
  async update(id: number, dto: UpdateStorageDto) {
    try {
      return await this.prisma.storageCapacity.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar
  async remove(id: number) {
    try {
      return await this.prisma.storageCapacity.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo de errores Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Capacidad de almacenamiento con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe un registro con un valor único duplicado');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
