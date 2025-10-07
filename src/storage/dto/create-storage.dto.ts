import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StorageType } from '@prisma/client';

export class CreateStorageDto {
  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @IsEnum(StorageType)
  @IsNotEmpty()
  type: StorageType;

  @IsInt()
  @IsNotEmpty()
  capacityGb: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
