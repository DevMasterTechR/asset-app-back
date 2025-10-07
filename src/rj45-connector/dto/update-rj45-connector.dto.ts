import { PartialType } from '@nestjs/mapped-types';
import { CreateRj45ConnectorDto } from './create-rj45-connector.dto';

export class UpdateRj45ConnectorDto extends PartialType(CreateRj45ConnectorDto) {}
