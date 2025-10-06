import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear nuevo departamento
  create(data: CreateDepartmentDto) {
    return this.prisma.department.create({
      data,
    });
  }

  // Obtener todos los departamentos
  findAll() {
    return this.prisma.department.findMany();
  }

  // Obtener un departamento por ID
  findOne(id: number) {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  // Actualizar un departamento
  update(id: number, data: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  // Eliminar un departamento
  remove(id: number) {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
