import { PartialType } from '@nestjs/swagger';
import { CreateNetworkAdapterDto } from './create-network-adapter.dto';

export class UpdateNetworkAdapterDto extends PartialType(CreateNetworkAdapterDto) {}
