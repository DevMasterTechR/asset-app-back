import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePowerStripDto } from './dto/create-power-strip.dto';
import { UpdatePowerStripDto } from './dto/update-power-strip.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PowerStripService {
  constructor(private prisma: PrismaService) {}

  // Crear
  async create(data: CreatePowerStripDto) {
    try {
      return await this.prisma.powerStrip.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos
  async findAll() {
    return this.prisma.powerStrip.findMany();
  }

  // Obtener uno
  async findOne(id: number) {
    const item = await this.prisma.powerStrip.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Regleta con ID ${id} no encontrada`);
    }

    return item;
  }

  // Actualizar
  async update(id: number, data: UpdatePowerStripDto) {
    try {
      return await this.prisma.powerStrip.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar
  async remove(id: number) {
    try {
      return await this.prisma.powerStrip.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Regleta con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una regleta con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
