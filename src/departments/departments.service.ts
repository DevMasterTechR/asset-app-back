import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear nuevo departamento
  async create(data: CreateDepartmentDto) {
    try {
      return await this.prisma.department.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos los departamentos
  async findAll() {
    return this.prisma.department.findMany();
  }

  // Obtener un departamento por ID
  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return department;
  }

  // Actualizar un departamento
  async update(id: number, data: UpdateDepartmentDto) {
    try {
      return await this.prisma.department.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar un departamento
  async remove(id: number) {
    try {
      return await this.prisma.department.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores de Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025': // Registro no encontrado
          throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
        case 'P2002': // Unique constraint violation
          throw new BadRequestException('El valor ya existe y debe ser único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    // Otros errores no controlados
    throw new InternalServerErrorException('Error interno del servidor');
  }
}
