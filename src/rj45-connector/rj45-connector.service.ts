import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRj45ConnectorDto } from './dto/create-rj45-connector.dto';
import { UpdateRj45ConnectorDto } from './dto/update-rj45-connector.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util'; // helper import

@Injectable()
export class Rj45ConnectorService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRj45ConnectorDto) {
    try {
      return await this.prisma.rj45Connector.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Conector RJ45');
    }
  }

  async findAll() {
    return this.prisma.rj45Connector.findMany();
  }

  async findOne(id: number) {
    const connector = await this.prisma.rj45Connector.findUnique({ where: { id } });
    if (!connector) {
      throw new NotFoundException(`Conector RJ45 con ID ${id} no encontrado`);
    }
    return connector;
  }

  async update(id: number, data: UpdateRj45ConnectorDto) {
    try {
      return await this.prisma.rj45Connector.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'Conector RJ45', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.rj45Connector.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Conector RJ45', id);
    }
  }
}
