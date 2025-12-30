import { PartialType } from '@nestjs/swagger';
import { CreateMouseDto } from './create-mouse.dto';

export class UpdateMouseDto extends PartialType(CreateMouseDto) {}
