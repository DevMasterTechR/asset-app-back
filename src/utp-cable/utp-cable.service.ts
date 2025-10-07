import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUtpCableDto } from './dto/create-utp-cable.dto';
import { UpdateUtpCableDto } from './dto/update-utp-cable.dto';

@Injectable()
export class UtpCableService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUtpCableDto) {
    return this.prisma.utpCable.create({ data: dto });
  }

  findAll() {
    return this.prisma.utpCable.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.utpCable.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Cable with ID ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateUtpCableDto) {
    try {
      return await this.prisma.utpCable.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Cable with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.utpCable.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Cable with ID ${id} not found`);
      }
      throw error;
    }
  }
}
