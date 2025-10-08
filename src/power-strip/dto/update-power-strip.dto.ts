import { PartialType } from '@nestjs/swagger';
import { CreatePowerStripDto } from './create-power-strip.dto';

export class UpdatePowerStripDto extends PartialType(CreatePowerStripDto) {}
