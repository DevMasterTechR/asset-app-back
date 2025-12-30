import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupportDto) {
    try {
      return await this.prisma.support.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Support');
    }
  }

  async findAll() {
    return this.prisma.support.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const support = await this.prisma.support.findUnique({ where: { id } });
    if (!support) throw new NotFoundException(`Soporte con ID ${id} no encontrado`);
    return support;
  }

  async update(id: number, dto: UpdateSupportDto) {
    try {
      return await this.prisma.support.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Support', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.support.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Support', id);
    }
  }
}
