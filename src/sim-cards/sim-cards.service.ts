import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';

@Injectable()
export class SimCardsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSimCardDto) {
    return this.prisma.simCard.create({ data });
  }

  findAll() {
    return this.prisma.simCard.findMany();
  }

  findOne(id: number) {
    return this.prisma.simCard.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateSimCardDto) {
    const exists = await this.prisma.simCard.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`SimCard with ID ${id} not found`);

    return this.prisma.simCard.update({ where: { id }, data });
  }

  async remove(id: number) {
    const exists = await this.prisma.simCard.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`SimCard with ID ${id} not found`);

    return this.prisma.simCard.delete({ where: { id } });
  }
}
