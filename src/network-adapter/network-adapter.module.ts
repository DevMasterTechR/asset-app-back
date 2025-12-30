import { Module } from '@nestjs/common';
import { NetworkAdapterService } from './network-adapter.service';
import { NetworkAdapterController } from './network-adapter.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NetworkAdapterController],
  providers: [NetworkAdapterService],
  exports: [NetworkAdapterService],
})
export class NetworkAdapterModule {}
