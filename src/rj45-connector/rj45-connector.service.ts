import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRj45ConnectorDto } from './dto/create-rj45-connector.dto';
import { UpdateRj45ConnectorDto } from './dto/update-rj45-connector.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class Rj45ConnectorService {
  constructor(private prisma: PrismaService) {}

  // Crear
  async create(data: CreateRj45ConnectorDto) {
    try {
      return await this.prisma.rj45Connector.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos
  async findAll() {
    return this.prisma.rj45Connector.findMany();
  }

  // Obtener uno por ID
  async findOne(id: number) {
    const connector = await this.prisma.rj45Connector.findUnique({ where: { id } });

    if (!connector) {
      throw new NotFoundException(`Conector RJ45 con ID ${id} no encontrado`);
    }

    return connector;
  }

  // Actualizar
  async update(id: number, data: UpdateRj45ConnectorDto) {
    try {
      return await this.prisma.rj45Connector.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar
  async remove(id: number) {
    try {
      return await this.prisma.rj45Connector.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo de errores Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Conector RJ45 con ID ${id} no encontrado`);
        case 'P2002':
          throw new BadRequestException('Ya existe un conector RJ45 con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
