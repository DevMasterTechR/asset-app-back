import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCredentialDto) {
    try {
      return await this.prisma.credential.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.credential.findMany();
  }

  async findOne(id: number) {
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    if (!credential) {
      throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
    }
    return credential;
  }

  async update(id: number, data: UpdateCredentialDto) {
    try {
      return await this.prisma.credential.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.credential.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una credencial con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
