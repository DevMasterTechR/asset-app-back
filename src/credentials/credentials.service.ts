import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCredentialDto) {
    try {
      return await this.prisma.credential.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Credencial');
    }
  }

  async findAll() {
    return this.prisma.credential.findMany();
  }

  async findOne(id: number) {
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    if (!credential) {
      throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
    }
    return credential;
  }

  async update(id: number, data: UpdateCredentialDto) {
    try {
      return await this.prisma.credential.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error, 'Credencial', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.credential.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Credencial', id);
    }
  }
}
