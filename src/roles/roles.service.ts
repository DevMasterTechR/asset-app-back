import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Rol');
    }
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    try {
      return await this.prisma.role.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Rol', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.role.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Rol', id);
    }
  }
}
