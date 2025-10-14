import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDepartmentDto) {
    try {
      return await this.prisma.department.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Departamento');
    }
  }

  async findAll() {
    return this.prisma.department.findMany();
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return department;
  }

  async update(id: number, data: UpdateDepartmentDto) {
    try {
      return await this.prisma.department.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'Departamento', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.department.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Departamento', id);
    }
  }
}
