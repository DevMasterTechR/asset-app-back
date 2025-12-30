import { PartialType } from '@nestjs/swagger';
import { CreateMousePadDto } from './create-mouse-pad.dto';

export class UpdateMousePadDto extends PartialType(CreateMousePadDto) {}
