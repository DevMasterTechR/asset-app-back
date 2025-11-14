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

  if (error instanceof Prisma.PrismaClientValidationError) {
    // Validation errors from Prisma (e.g., wrong types in query)
    throw new BadRequestException(`Error de validación de Prisma: ${error.message}`);
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new InternalServerErrorException('Error desconocido de Prisma');
  }

  // Fallback: include message when available to help debugging
  const msg = error && error.message ? String(error.message) : 'Error interno del servidor';
  throw new InternalServerErrorException(msg);
}
