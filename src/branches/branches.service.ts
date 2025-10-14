import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';


@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({ data });
    } catch (error) {
      handlePrismaError(error, 'Sucursal');
    }
  }

  async findAll() {
    return this.prisma.branch.findMany();
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }
    return branch;
  }

  async update(id: number, data: UpdateBranchDto) {
    try {
      return await this.prisma.branch.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'Sucursal', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.branch.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Sucursal', id);
    }
  }
}
