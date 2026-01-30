import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateRj45ConnectorDto {
  @ApiProperty({
    example: 'Cat6 UTP',
    description: 'Modelo del conector RJ45',
  })
  @IsString()
  model: string;

  @ApiProperty({
    example: 100,
    description: 'Cantidad de conectores disponibles',
  })
  @IsInt()
  quantityUnits: number;

  @ApiPropertyOptional({
    example: 'Plástico',
    description: 'Material del conector (opcional)',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'RJ45 Macho',
    description: 'Tipo de conector (opcional)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 12.5,
    description: 'Precio de compra (opcional)',
  })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: '2023-10-01',
    description: 'Fecha de compra (opcional, formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @ApiPropertyOptional({
    example: '2023-10-15',
    description: 'Fecha de uso (opcional, formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  usageDate?: Date;

  @ApiPropertyOptional({
    example: 'Conectores usados para instalación en oficina',
    description: 'Notas adicionales (opcional)',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
