import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemoryAdapterDto } from './dto/create-memory-adapter.dto';
import { UpdateMemoryAdapterDto } from './dto/update-memory-adapter.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class MemoryAdapterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMemoryAdapterDto) {
    try {
      return await this.prisma.memoryAdapter.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Adaptador de memoria');
    }
  }

  async findAll() {
    return this.prisma.memoryAdapter.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.memoryAdapter.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Adaptador de memoria con ID ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateMemoryAdapterDto) {
    try {
      return await this.prisma.memoryAdapter.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Adaptador de memoria', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.memoryAdapter.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Adaptador de memoria', id);
    }
  }
}
