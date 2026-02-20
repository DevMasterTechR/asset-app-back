import { PartialType } from '@nestjs/swagger';
import { CreateUsbDto } from './create-usb.dto';

export class UpdateUsbDto extends PartialType(CreateUsbDto) {}
