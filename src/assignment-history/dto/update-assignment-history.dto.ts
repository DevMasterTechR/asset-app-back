import { PartialType } from '@nestjs/swagger';

import { CreateAssignmentHistoryDto } from './create-assignment-history.dto';

export class UpdateAssignmentHistoryDto extends PartialType(CreateAssignmentHistoryDto) {}
