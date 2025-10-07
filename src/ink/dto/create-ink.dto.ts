import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateInkDto {
  @IsString()
  @MaxLength(100)
  brand: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsString()
  @MaxLength(50)
  color: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  inkType?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsDateString()
  @IsOptional()
  usageDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
