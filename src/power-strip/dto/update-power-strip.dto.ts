import { PartialType } from '@nestjs/mapped-types';
import { CreatePowerStripDto } from './create-power-strip.dto';

export class UpdatePowerStripDto extends PartialType(CreatePowerStripDto) {}
