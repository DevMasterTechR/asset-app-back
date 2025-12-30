import { Module } from '@nestjs/common';
import { MousePadService } from './mouse-pad.service';
import { MousePadController } from './mouse-pad.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MousePadController],
  providers: [MousePadService],
  exports: [MousePadService],
})
export class MousePadModule {}
