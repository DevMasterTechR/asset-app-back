import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsJSON,
} from 'class-validator';

export enum AssetStatus {
  available = 'available',
  assigned = 'assigned',
  maintenance = 'maintenance',
  decommissioned = 'decommissioned',
}

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetCode: string;

  @IsString()
  @IsNotEmpty()
  assetType: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsInt()
  branchId?: number;

  @IsOptional()
  @IsInt()
  assignedPersonId?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  attributesJson?: any; // puedes usar JSON.parse y validar en servicio si prefieres
}
