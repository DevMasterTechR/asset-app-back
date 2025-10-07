import { Module } from '@nestjs/common';
import { AssignmentHistoryController } from './assignment-history.controller';
import { AssignmentHistoryService } from './assignment-history.service';

@Module({
  controllers: [AssignmentHistoryController],
  providers: [AssignmentHistoryService]
})
export class AssignmentHistoryModule {}
