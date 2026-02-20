import { Module } from '@nestjs/common';
import { UsbService } from './usb.service';
import { UsbController } from './usb.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsbController],
  providers: [UsbService],
  exports: [UsbService],
})
export class UsbModule {}
