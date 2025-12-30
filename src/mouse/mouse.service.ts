import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMouseDto } from './dto/create-mouse.dto';
import { UpdateMouseDto } from './dto/update-mouse.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class MouseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMouseDto) {
    try {
      return await this.prisma.mouse.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Mouse');
    }
  }

  async findAll() {
    return this.prisma.mouse.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const mouse = await this.prisma.mouse.findUnique({ where: { id } });
    if (!mouse) throw new NotFoundException(`Mouse con ID ${id} no encontrado`);
    return mouse;
  }

  async update(id: number, dto: UpdateMouseDto) {
    try {
      return await this.prisma.mouse.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Mouse', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.mouse.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Mouse', id);
    }
  }
}
