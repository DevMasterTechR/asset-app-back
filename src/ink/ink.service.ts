import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInkDto } from './dto/create-ink.dto';
import { UpdateInkDto } from './dto/update-ink.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InkService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear tinta
  async create(dto: CreateInkDto) {
    try {
      return await this.prisma.ink.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todas
  async findAll() {
    return this.prisma.ink.findMany();
  }

  // Obtener una por ID
  async findOne(id: number) {
    const ink = await this.prisma.ink.findUnique({ where: { id } });
    if (!ink) throw new NotFoundException(`Tinta con ID ${id} no encontrada`);
    return ink;
  }

  // Actualizar
  async update(id: number, dto: UpdateInkDto) {
    try {
      return await this.prisma.ink.update({ where: { id }, data: dto });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar
  async remove(id: number) {
    try {
      return await this.prisma.ink.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Tinta con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una tinta con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
