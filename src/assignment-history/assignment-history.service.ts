import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssignmentHistoryDto) {
    try {
      return await this.prisma.assignmentHistory.create({ data });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.assignmentHistory.findMany();
  }

  async findOne(id: number) {
    const record = await this.prisma.assignmentHistory.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }
    return record;
  }

  async update(id: number, data: UpdateAssignmentHistoryDto) {
    try {
      return await this.prisma.assignmentHistory.update({ where: { id }, data });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.assignmentHistory.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Historial con ID ${id} no encontrado`);
        case 'P2002':
          throw new BadRequestException('Ya existe un historial con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}
