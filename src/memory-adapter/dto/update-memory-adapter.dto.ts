import { PartialType } from '@nestjs/swagger';
import { CreateMemoryAdapterDto } from './create-memory-adapter.dto';

export class UpdateMemoryAdapterDto extends PartialType(CreateMemoryAdapterDto) {}
