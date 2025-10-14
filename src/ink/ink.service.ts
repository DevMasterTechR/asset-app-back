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
      return await this.prisma.ink.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Tinta');
    }
  }

  async findAll() {
    return this.prisma.ink.findMany();
  }

  async findOne(id: number) {
    const ink = await this.prisma.ink.findUnique({ where: { id } });
    if (!ink) throw new NotFoundException(`Tinta con ID ${id} no encontrada`);
    return ink;
  }

  async update(id: number, dto: UpdateInkDto) {
    try {
      return await this.prisma.ink.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Tinta', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.ink.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Tinta', id);
    }
  }
}
