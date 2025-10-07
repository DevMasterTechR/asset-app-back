import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SimCardsService {
  constructor(private prisma: PrismaService) {}

  // Crear tarjeta SIM
  async create(data: CreateSimCardDto) {
    try {
      return await this.prisma.simCard.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todas
  async findAll() {
    return this.prisma.simCard.findMany();
  }

  // Obtener una por ID
  async findOne(id: number) {
    const sim = await this.prisma.simCard.findUnique({ where: { id } });

    if (!sim) {
      throw new NotFoundException(`SIM card con ID ${id} no encontrada`);
    }

    return sim;
  }

  // Actualizar
  async update(id: number, data: UpdateSimCardDto) {
    try {
      return await this.prisma.simCard.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar
  async remove(id: number) {
    try {
      return await this.prisma.simCard.delete({
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
          throw new NotFoundException(`SIM card con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una SIM card con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
