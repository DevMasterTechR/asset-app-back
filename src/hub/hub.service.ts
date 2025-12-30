import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHubDto } from './dto/create-hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class HubService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHubDto) {
    try {
      return await this.prisma.hub.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Hub');
    }
  }

  async findAll() {
    return this.prisma.hub.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const hub = await this.prisma.hub.findUnique({ where: { id } });
    if (!hub) throw new NotFoundException(`Hub con ID ${id} no encontrado`);
    return hub;
  }

  async update(id: number, dto: UpdateHubDto) {
    try {
      return await this.prisma.hub.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Hub', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.hub.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Hub', id);
    }
  }
}
