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

  // Obtener todas las personas
  async findAll() {
    return this.prisma.person.findMany({
      include: {
        department: true,
        role: true,
        branch: true,
      },
    });
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
      return await this.prisma.person.update({
        where: { id },
        data,
      });
    } catch (error) {
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


