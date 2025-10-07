import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateRj45ConnectorDto {
  @IsString()
  model: string;

  @IsInt()
  quantityUnits: number;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  type?: string;

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
