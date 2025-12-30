import { PartialType } from '@nestjs/swagger';
import { CreateKeyboardDto } from './create-keyboard.dto';

export class UpdateKeyboardDto extends PartialType(CreateKeyboardDto) {}
