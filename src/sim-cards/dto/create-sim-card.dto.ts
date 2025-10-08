import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimPlanType, SimStatus } from '@prisma/client';

export class CreateSimCardDto {
  @ApiProperty({
    description: 'ID del activo asociado a la tarjeta SIM',
    example: 101,
  })
  @IsInt()
  assetId: number;

  @ApiProperty({
    description: 'Nombre del proveedor de servicios móviles (carrier)',
    example: 'Movistar',
  })
  @IsString()
  @IsNotEmpty()
  carrier: string;

  @ApiProperty({
    description: 'Número de teléfono asignado a la SIM',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Tipo de plan asociado a la SIM',
    enum: SimPlanType,
    example: SimPlanType.prepago,
  })
  @IsEnum(SimPlanType)
  planType: SimPlanType;

  @ApiPropertyOptional({
    description: 'Estado actual de la SIM',
    enum: SimStatus,
    example: SimStatus.activo,
  })
  @IsOptional()
  @IsEnum(SimStatus)
  status?: SimStatus;

  @ApiPropertyOptional({
    description: 'Fecha de activación de la SIM (formato ISO)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  activationDate?: Date;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la SIM',
    example: 'SIM utilizada para pruebas internas',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
