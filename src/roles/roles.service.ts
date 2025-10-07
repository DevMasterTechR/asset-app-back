import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear nuevo rol
  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todos los roles
  async findAll() {
    return this.prisma.role.findMany();
  }

  // Obtener un rol por ID
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  // Actualizar un rol
  async update(id: number, dto: UpdateRoleDto) {
    try {
      return await this.prisma.role.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar un rol
  async remove(id: number) {
    try {
      return await this.prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Manejo centralizado de errores Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        case 'P2002':
          throw new BadRequestException('Ya existe un rol con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
