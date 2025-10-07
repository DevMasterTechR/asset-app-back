import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un nuevo activo
  async create(data: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos los activos
  async findAll() {
    return this.prisma.asset.findMany();
  }

  // Obtener un activo por ID
  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    return asset;
  }

  // Actualizar un activo
  async update(id: number, data: UpdateAssetDto) {
    try {
      return await this.prisma.asset.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar un activo
  async remove(id: number) {
    try {
      return await this.prisma.asset.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores de Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Activo con ID ${id} no encontrado`);
        case 'P2002':
          throw new BadRequestException('Ya existe un activo con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
