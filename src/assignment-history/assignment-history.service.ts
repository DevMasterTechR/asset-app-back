import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';

@Injectable()
export class AssignmentHistoryService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAssignmentHistoryDto) {
    return this.prisma.assignmentHistory.create({ data });
  }

  findAll() {
    return this.prisma.assignmentHistory.findMany();
  }

  findOne(id: number) {
    return this.prisma.assignmentHistory.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateAssignmentHistoryDto) {
    return this.prisma.assignmentHistory.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.assignmentHistory.delete({ where: { id } });
  }
}
