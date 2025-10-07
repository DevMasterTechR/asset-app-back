import { PartialType } from '@nestjs/mapped-types';
import { CreateUtpCableDto } from './create-utp-cable.dto';

export class UpdateUtpCableDto extends PartialType(CreateUtpCableDto) {}
