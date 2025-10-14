import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';

@Injectable()
export class AssignmentHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssignmentHistoryDto) {
    try {
      return await this.prisma.assignmentHistory.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Historial');
    }
  }

  findAll() {
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
      handlePrismaError(error, 'Historial', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.assignmentHistory.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Historial', id);
    }
  }
}
