import { Module } from '@nestjs/common';
import { PowerStripController } from './power-strip.controller';
import { PowerStripService } from './power-strip.service';

@Module({
  controllers: [PowerStripController],
  providers: [PowerStripService]
})
export class PowerStripModule {}
