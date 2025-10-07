import { PartialType } from '@nestjs/mapped-types';
import { CreateInkDto } from './create-ink.dto';

export class UpdateInkDto extends PartialType(CreateInkDto) {}
