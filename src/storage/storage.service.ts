import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';

@Injectable()
export class StorageService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateStorageDto) {
    return this.prisma.storageCapacity.create({ data });
  }

  findAll() {
    return this.prisma.storageCapacity.findMany();
  }

  findOne(id: number) {
    return this.prisma.storageCapacity.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateStorageDto) {
    return this.prisma.storageCapacity.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.storageCapacity.delete({ where: { id } });
  }
}
