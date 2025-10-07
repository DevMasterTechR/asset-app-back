import { Module } from '@nestjs/common';
import { Rj45ConnectorController } from './rj45-connector.controller';
import { Rj45ConnectorService } from './rj45-connector.service';

@Module({
  controllers: [Rj45ConnectorController],
  providers: [Rj45ConnectorService]
})
export class Rj45ConnectorModule {}
