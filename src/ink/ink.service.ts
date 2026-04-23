import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInkDto } from './dto/create-ink.dto';
import { UpdateInkDto } from './dto/update-ink.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class InkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInkDto) {
    try {
      return await (this.prisma as any).ink.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Tinta');
    }
  }

  async findAll() {
    try {
      return await (this.prisma as any).ink.findMany();
    } catch (error) {
      handlePrismaError(error, 'Tinta');
    }
  }

  async findOne(id: number) {
    const ink = await (this.prisma as any).ink.findUnique({ where: { id } });
    if (!ink) throw new NotFoundException(`Tinta con ID ${id} no encontrada`);
    return ink;
  }

  async update(id: number, dto: UpdateInkDto) {
    try {
      return await (this.prisma as any).ink.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Tinta', id);
    }
  }

  async remove(id: number) {
    try {
      return await (this.prisma as any).ink.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Tinta', id);
    }
  }
}
