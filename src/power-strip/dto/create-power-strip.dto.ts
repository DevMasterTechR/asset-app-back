import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePowerStripDto {
  @ApiPropertyOptional({
    description: 'Marca del multicontacto',
    example: 'APC',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: 'Modelo del multicontacto',
    example: 'SurgeArrest P6B',
  })
  @IsString()
  model: string;

  @ApiPropertyOptional({
    description: 'Cantidad de enchufes (salidas)',
    example: 6,
  })
  @IsOptional()
  @IsInt()
  outletCount?: number;

  @ApiPropertyOptional({
    description: 'Longitud del cable en metros',
    example: 1.8,
  })
  @IsOptional()
  @IsNumber()
  lengthMeters?: number;

  @ApiPropertyOptional({
    description: 'Color del multicontacto',
    example: 'Negro',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Capacidad eléctrica en vatios',
    example: 1800,
  })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Precio de compra del multicontacto',
    example: 19.99,
  })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Fecha de compra (formato ISO)',
    example: '2023-05-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de uso (formato ISO)',
    example: '2023-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  usageDate?: Date;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el multicontacto',
    example: 'Usado en la sala de servidores',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
