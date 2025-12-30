import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class KeyboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKeyboardDto) {
    try {
      return await this.prisma.keyboard.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Teclado');
    }
  }

  async findAll() {
    return this.prisma.keyboard.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const keyboard = await this.prisma.keyboard.findUnique({ where: { id } });
    if (!keyboard) throw new NotFoundException(`Teclado con ID ${id} no encontrado`);
    return keyboard;
  }

  async update(id: number, dto: UpdateKeyboardDto) {
    try {
      return await this.prisma.keyboard.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Teclado', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.keyboard.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Teclado', id);
    }
  }
}
