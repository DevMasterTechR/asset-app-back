import { PartialType } from '@nestjs/swagger';
import { CreateRj45ConnectorDto } from './create-rj45-connector.dto';

export class UpdateRj45ConnectorDto extends PartialType(CreateRj45ConnectorDto) {}
