import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';
import { Condition } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
    @ApiProperty({ description: 'ID del activo en préstamo', example: 123 })
    @IsInt()
    assetId: number;

    @ApiProperty({
        description: 'ID de la persona a la que se presta el activo',
        example: 456,
    })
    @IsInt()
    personId: number;

    @ApiPropertyOptional({ description: 'ID de la sucursal', example: 789 })
    @IsOptional()
    @IsInt()
    branchId?: number;

    @ApiProperty({
        description: 'Número de días del préstamo',
        example: 7,
    })
    @IsInt()
    loanDays: number;

    @ApiPropertyOptional({
        description: 'Fecha de préstamo',
        example: '2023-09-15T14:48:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    loanDate?: Date;

    @ApiPropertyOptional({
        enum: Condition,
        description: 'Condición al momento del préstamo',
    })
    @IsOptional()
    @IsEnum(Condition)
    deliveryCondition?: Condition;

    @ApiPropertyOptional({
        description: 'Notas sobre el préstamo',
        example: 'El activo se prestó en condiciones óptimas',
    })
    @IsOptional()
    @IsString()
    deliveryNotes?: string;
}
