import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsbDto } from './dto/create-usb.dto';
import { UpdateUsbDto } from './dto/update-usb.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class UsbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsbDto) {
    try {
      return await this.prisma.usb.create({ data: dto });
    } catch (error) {
      handlePrismaError(error, 'USB');
    }
  }

  async findAll() {
    return this.prisma.usb.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const usb = await this.prisma.usb.findUnique({ where: { id } });
    if (!usb) throw new NotFoundException(`USB con ID ${id} no encontrado`);
    return usb;
  }

  async update(id: number, dto: UpdateUsbDto) {
    try {
      return await this.prisma.usb.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error, 'USB', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.usb.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'USB', id);
    }
  }
}
