import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUtpCableDto } from './dto/create-utp-cable.dto';
import { UpdateUtpCableDto } from './dto/update-utp-cable.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UtpCableService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un nuevo cable
  async create(dto: CreateUtpCableDto) {
    try {
      return await this.prisma.utpCable.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos los cables
  async findAll() {
    return this.prisma.utpCable.findMany();
  }

  // Obtener uno por ID
  async findOne(id: number) {
    const item = await this.prisma.utpCable.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Cable con ID ${id} no encontrado`);
    }

    return item;
  }

  // Actualizar
  async update(id: number, dto: UpdateUtpCableDto) {
    try {
      return await this.prisma.utpCable.update({
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
      return await this.prisma.utpCable.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Cable con ID ${id} no encontrado`);
        case 'P2002':
          throw new BadRequestException('Ya existe un cable con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
