import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCredentialDto) {
    return this.prisma.credential.create({ data });
  }

  findAll() {
    return this.prisma.credential.findMany();
  }

  findOne(id: number) {
    return this.prisma.credential.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateCredentialDto) {
    const exists = await this.prisma.credential.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Credential with ID ${id} not found`);
    return this.prisma.credential.update({ where: { id }, data });
  }

  async remove(id: number) {
    const exists = await this.prisma.credential.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Credential with ID ${id} not found`);
    return this.prisma.credential.delete({ where: { id } });
  }
}
