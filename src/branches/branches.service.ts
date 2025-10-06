import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBranchDto) {
    return this.prisma.branch.create({ data });
  }

  findAll() {
    return this.prisma.branch.findMany();
  }

  findOne(id: number) {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.branch.delete({ where: { id } });
  }
}
