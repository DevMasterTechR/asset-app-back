import { Module } from '@nestjs/common';
import { KeyboardService } from './keyboard.service';
import { KeyboardController } from './keyboard.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KeyboardController],
  providers: [KeyboardService],
  exports: [KeyboardService],
})
export class KeyboardModule {}
