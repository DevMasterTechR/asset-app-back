import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInkDto } from './dto/create-ink.dto';
import { UpdateInkDto } from './dto/update-ink.dto';

@Injectable()
export class InkService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInkDto) {
    return this.prisma.ink.create({ data: dto });
  }

  findAll() {
    return this.prisma.ink.findMany();
  }

  async findOne(id: number) {
    const ink = await this.prisma.ink.findUnique({ where: { id } });
    if (!ink) throw new NotFoundException(`Ink with ID ${id} not found`);
    return ink;
  }

  async update(id: number, dto: UpdateInkDto) {
    try {
      return await this.prisma.ink.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Ink with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.ink.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Ink with ID ${id} not found`);
      }
      throw error;
    }
  }
}
