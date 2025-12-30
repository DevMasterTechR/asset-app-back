import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMousePadDto } from './dto/create-mouse-pad.dto';
import { UpdateMousePadDto } from './dto/update-mouse-pad.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class MousePadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMousePadDto) {
    try {
      return await this.prisma.mousePad.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'MousePad');
    }
  }

  async findAll() {
    return this.prisma.mousePad.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.mousePad.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`MousePad con ID ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateMousePadDto) {
    try {
      return await this.prisma.mousePad.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'MousePad', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.mousePad.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'MousePad', id);
    }
  }
}
