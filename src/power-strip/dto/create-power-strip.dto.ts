import { IsString, IsOptional, IsInt, IsDateString, IsNumber } from 'class-validator';

export class CreatePowerStripDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsInt()
  outletCount?: number;

  @IsOptional()
  @IsNumber()
  lengthMeters?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @IsOptional()
  @IsDateString()
  usageDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
