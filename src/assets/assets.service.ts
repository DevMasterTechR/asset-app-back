import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAssetDto) {
    return this.prisma.asset.create({ data });
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  findOne(id: number) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
