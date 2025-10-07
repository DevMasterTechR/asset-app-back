import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePowerStripDto } from './dto/create-power-strip.dto';
import { UpdatePowerStripDto } from './dto/update-power-strip.dto';

@Injectable()
export class PowerStripService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePowerStripDto) {
    return this.prisma.powerStrip.create({ data });
  }

  findAll() {
    return this.prisma.powerStrip.findMany();
  }

  findOne(id: number) {
    return this.prisma.powerStrip.findUnique({ where: { id } });
  }

  update(id: number, data: UpdatePowerStripDto) {
    return this.prisma.powerStrip.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.powerStrip.delete({ where: { id } });
  }
}
