import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  IsDateString,
  IsIn
} from 'class-validator';

export class CreateUtpCableDto {
  @IsString()
  @MaxLength(100)
  brand: string;

  @IsString()
  @IsIn(['Cat5', 'Cat5e', 'Cat6', 'Cat6a', 'Cat7', 'Cat8']) // ejemplo
  type: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  material?: string;

  @IsInt()
  @IsOptional()
  lengthMeters?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

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
