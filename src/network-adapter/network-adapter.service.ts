import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNetworkAdapterDto } from './dto/create-network-adapter.dto';
import { UpdateNetworkAdapterDto } from './dto/update-network-adapter.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class NetworkAdapterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNetworkAdapterDto) {
    try {
      return await this.prisma.networkAdapter.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'NetworkAdapter');
    }
  }

  async findAll() {
    return this.prisma.networkAdapter.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const adapter = await this.prisma.networkAdapter.findUnique({ where: { id } });
    if (!adapter) throw new NotFoundException(`Adaptador de red con ID ${id} no encontrado`);
    return adapter;
  }

  async update(id: number, dto: UpdateNetworkAdapterDto) {
    try {
      return await this.prisma.networkAdapter.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'NetworkAdapter', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.networkAdapter.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'NetworkAdapter', id);
    }
  }
}
