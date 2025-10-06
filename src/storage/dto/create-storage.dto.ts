import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StorageType as PrismaStorageType } from '@prisma/client';

export class CreateStorageDto {
  @IsInt()
  assetId: number;

  @IsEnum(PrismaStorageType) // Aquí usas el enum de Prisma
  type: PrismaStorageType;

  @IsInt()
  capacityGb: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
