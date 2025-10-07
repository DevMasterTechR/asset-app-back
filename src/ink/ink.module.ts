import { Module } from '@nestjs/common';
import { InkService } from './ink.service';
import { InkController } from './ink.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InkController],
  providers: [InkService, PrismaService],
})
export class InkModule {}
