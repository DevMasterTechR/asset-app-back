import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

    async create(data: CreatePersonDto) {
    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }
    return this.prisma.person.create({ data });
    }


  findAll() {
    return this.prisma.person.findMany({
      include: {
        department: true,
        role: true,
        branch: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.person.findUnique({
      where: { id },
      include: {
        department: true,
        role: true,
        branch: true,
      },
    });
  }

  update(id: number, data: UpdatePersonDto) {
    return this.prisma.person.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.person.delete({ where: { id } });
  }
}



