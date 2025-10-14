import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePowerStripDto } from './dto/create-power-strip.dto';
import { UpdatePowerStripDto } from './dto/update-power-strip.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class PowerStripService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePowerStripDto) {
    try {
      return await this.prisma.powerStrip.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Regleta');
    }
  }

  async findAll() {
    return this.prisma.powerStrip.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.powerStrip.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Regleta con ID ${id} no encontrada`);
    return item;
  }

  async update(id: number, data: UpdatePowerStripDto) {
    try {
      return await this.prisma.powerStrip.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'Regleta', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.powerStrip.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Regleta', id);
    }
  }
}

