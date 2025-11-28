import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear persona (con hash de contraseña)
  async create(data: CreatePersonDto) {
    try {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }

      return await this.prisma.person.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Obtener todas las personas con soporte de búsqueda y paginación
  async findAll(q?: string, page = 1, limit = 10) {
    const where: any = {};

    if (q && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { username: { contains: term, mode: 'insensitive' } },
        { nationalId: { contains: term, mode: 'insensitive' } },
      ];
    }

    const take = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (Number(page) > 1 ? Number(page) - 1 : 0) * take;

    const [data, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        include: { department: true, role: true, branch: true },
        skip,
        take,
      }),
      this.prisma.person.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / take));

    return {
      data,
      total,
      page: Number(page),
      limit: take,
      totalPages,
    };
  }

  // Obtener persona por ID
  async findOne(id: number) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        department: true,
        role: true,
        branch: true,
      },
    });

    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return person;
  }

  // Actualizar persona
  async update(id: number, data: UpdatePersonDto) {
    try {
      const payload: any = { ...data };

      // Si se envía password en el update, hashearla antes de guardar
      if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
      }

      // Coerce numeric IDs if they were sent as strings
      const numericFields = ['departmentId', 'roleId', 'branchId'];
      for (const f of numericFields) {
        if (payload[f] !== undefined && payload[f] !== null && typeof payload[f] === 'string') {
          const n = Number(payload[f]);
          if (!isNaN(n)) payload[f] = n;
        }
      }

      return await this.prisma.person.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      // Loguear el error completo para ayudar a depuración
      console.error('[PeopleService.update] caught error:', error && error.stack ? error.stack : error);
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar persona
  async remove(id: number) {
    try {
      return await this.prisma.person.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async findUserDetails(id: number) {
  return this.prisma.person.findUnique({
    where: { id },
    include: {
      branch: true,
      department: true,
      role: true,
      assets: true,
    },
  });
}

  // Manejo de errores de Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Persona con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una persona con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}


