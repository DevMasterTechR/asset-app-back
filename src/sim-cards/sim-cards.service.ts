import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util'; // <-- helper para errores Prisma

@Injectable()
export class SimCardsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSimCardDto) {
    try {
      return await this.prisma.simCard.create({ data });
    } catch (error) {
      handlePrismaError(error, 'SIM card');
    }
  }

  async findAll() {
    return this.prisma.simCard.findMany();
  }

  async findOne(id: number) {
    const sim = await this.prisma.simCard.findUnique({ where: { id } });

    if (!sim) {
      throw new NotFoundException(`SIM card con ID ${id} no encontrada`);
    }

    return sim;
  }

  async update(id: number, data: UpdateSimCardDto) {
    try {
      return await this.prisma.simCard.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'SIM card', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.simCard.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'SIM card', id);
    }
  }
}
