import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear nueva sucursal
  async create(data: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todas las sucursales
  async findAll() {
    return this.prisma.branch.findMany();
  }

  // Obtener una sucursal por ID
  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });

    if (!branch) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    return branch;
  }

  // Actualizar una sucursal
  async update(id: number, data: UpdateBranchDto) {
    try {
      return await this.prisma.branch.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar una sucursal
  async remove(id: number) {
    try {
      return await this.prisma.branch.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una sucursal con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
