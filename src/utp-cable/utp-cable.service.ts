import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUtpCableDto } from './dto/create-utp-cable.dto';
import { UpdateUtpCableDto } from './dto/update-utp-cable.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class UtpCableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUtpCableDto) {
    try {
      return await this.prisma.utpCable.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'Cable');
    }
  }

  async findAll() {
    return this.prisma.utpCable.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.utpCable.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Cable con ID ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateUtpCableDto) {
    try {
      return await this.prisma.utpCable.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'Cable', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.utpCable.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Cable', id);
    }
  }
}
