import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Central',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Dirección física de la sucursal',
    example: 'Av. Siempre Viva 742',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Región o zona geográfica de la sucursal',
    example: 'Región Metropolitana',
  })
  @IsOptional()
  @IsString()
  region?: string;
}
