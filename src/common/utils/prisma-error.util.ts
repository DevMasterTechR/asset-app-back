import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: any, entity = 'Recurso', id?: number): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        throw new NotFoundException(`${entity} con ID ${id} no encontrado`);
      case 'P2002':
        throw new BadRequestException(`${entity} duplicado`);
      default:
        throw new BadRequestException('Error en la solicitud');
    }
  }

  throw new InternalServerErrorException('Error interno del servidor');
}
