import { PartialType } from '@nestjs/swagger';
import { CreateUtpCableDto } from './create-utp-cable.dto';

export class UpdateUtpCableDto extends PartialType(CreateUtpCableDto) {}
