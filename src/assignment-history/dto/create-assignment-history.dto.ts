import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Condition } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentHistoryDto {
  @ApiProperty({ description: 'ID del activo asignado', example: 123 })
  @IsInt()
  assetId: number;

  @ApiProperty({ description: 'ID de la persona a la que se asigna el activo', example: 456 })
  @IsInt()
  personId: number;

  @ApiPropertyOptional({ description: 'ID de la sucursal', example: 789 })
  @IsOptional()
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({ description: 'Fecha de asignación', example: '2023-09-15T14:48:00.000Z' })
  @IsOptional()
  @IsDateString()
  assignmentDate?: Date;

  @ApiPropertyOptional({ description: 'Fecha de devolución', example: '2023-09-30T14:48:00.000Z' })
  @IsOptional()
  @IsDateString()
  returnDate?: Date;

  @ApiPropertyOptional({ enum: Condition, description: 'Condición al momento de la entrega' })
  @IsOptional()
  @IsEnum(Condition)
  deliveryCondition?: Condition;

  @ApiPropertyOptional({ enum: Condition, description: 'Condición al momento de la devolución' })
  @IsOptional()
  @IsEnum(Condition)
  returnCondition?: Condition;

  @ApiPropertyOptional({ description: 'Notas sobre la entrega', example: 'El activo se entregó con caja original' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'Notas sobre la devolución', example: 'El activo presenta ligeros daños' })
  @IsOptional()
  @IsString()
  returnNotes?: string;
}
