import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRj45ConnectorDto } from './dto/create-rj45-connector.dto';
import { UpdateRj45ConnectorDto } from './dto/update-rj45-connector.dto';

@Injectable()
export class Rj45ConnectorService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateRj45ConnectorDto) {
    return this.prisma.rj45Connector.create({ data });
  }

  findAll() {
    return this.prisma.rj45Connector.findMany();
  }

  findOne(id: number) {
    return this.prisma.rj45Connector.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateRj45ConnectorDto) {
    return this.prisma.rj45Connector.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.rj45Connector.delete({ where: { id } });
  }
}
