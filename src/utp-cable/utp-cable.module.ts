import { Module } from '@nestjs/common';
import { UtpCableController } from './utp-cable.controller';
import { UtpCableService } from './utp-cable.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UtpCableController],
  providers: [UtpCableService, PrismaService],
})
export class UtpCableModule {}
