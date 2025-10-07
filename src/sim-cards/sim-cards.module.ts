import { Module } from '@nestjs/common';
import { SimCardsController } from './sim-cards.controller';
import { SimCardsService } from './sim-cards.service';

@Module({
  controllers: [SimCardsController],
  providers: [SimCardsService]
})
export class SimCardsModule {}
