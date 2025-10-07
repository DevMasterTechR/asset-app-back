import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentHistoryDto } from './create-assignment-history.dto';

export class UpdateAssignmentHistoryDto extends PartialType(CreateAssignmentHistoryDto) {}
