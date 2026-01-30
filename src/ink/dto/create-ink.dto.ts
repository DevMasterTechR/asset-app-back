import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInkDto {
  @ApiProperty({
    description: 'Marca de la tinta',
    example: 'HP',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({
    description: 'Modelo de la tinta',
    example: '664XL',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  model: string;

  @ApiProperty({
    description: 'Color de la tinta',
    example: 'Negro',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  color: string;

  @ApiPropertyOptional({
    description: 'Cantidad de cartuchos disponibles',
    example: 10,
  })
  @IsInt()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Tipo de tinta (por ejemplo: tinta, tóner, gel)',
    example: 'tinta',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  inkType?: string;

  @ApiPropertyOptional({
    description: 'Precio de compra',
    example: 15.5,
  })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Fecha de compra en formato ISO',
    example: '2023-08-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de primer uso en formato ISO',
    example: '2023-09-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  usageDate?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la tinta',
    example: 'Reservado para impresora de recepción.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
