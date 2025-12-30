import { Module } from '@nestjs/common';
import { MemoryAdapterService } from './memory-adapter.service';
import { MemoryAdapterController } from './memory-adapter.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MemoryAdapterController],
  providers: [MemoryAdapterService],
  exports: [MemoryAdapterService],
})
export class MemoryAdapterModule {}
