// create-utp-cable.dto.ts
import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  IsDateString,
  IsIn
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUtpCableDto {
  @ApiProperty({
    description: 'Marca del cable UTP',
    example: 'Panduit',
    maxLength: 100,
    type: String,
  })
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({
    description: 'Tipo/categoría del cable UTP',
    example: 'Cat6',
    enum: ['Cat5', 'Cat5e', 'Cat6', 'Cat6a', 'Cat7', 'Cat8'],
    type: String,
  })
  @IsString()
  @IsIn(['Cat5', 'Cat5e', 'Cat6', 'Cat6a', 'Cat7', 'Cat8'])
  type: string;

  @ApiProperty({
    description: 'Material del cable',
    example: 'Cobre',
    maxLength: 100,
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  material?: string;

  @ApiProperty({
    description: 'Longitud del cable en metros',
    example: 305,
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  lengthMeters?: number;

  @ApiProperty({
    description: 'Color del cable',
    example: 'Azul',
    maxLength: 50,
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  @ApiProperty({
    description: 'Fecha de compra del cable (formato ISO 8601)',
    example: '2024-01-15',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({
    description: 'Fecha de inicio de uso del cable (formato ISO 8601)',
    example: '2024-02-01',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  usageDate?: string;

  @ApiProperty({
    description: 'Notas o comentarios adicionales sobre el cable',
    example: 'Cable instalado en el rack principal del segundo piso',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

