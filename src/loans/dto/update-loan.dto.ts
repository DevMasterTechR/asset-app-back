import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';
import { Condition } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLoanDto {
    @ApiPropertyOptional({
        description: 'Fecha de devolución',
        example: '2023-09-30T14:48:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    returnDate?: Date;

    @ApiPropertyOptional({
        enum: Condition,
        description: 'Condición al momento de la devolución',
    })
    @IsOptional()
    @IsEnum(Condition)
    returnCondition?: Condition;

    @ApiPropertyOptional({
        description: 'Notas sobre la devolución',
        example: 'El activo se devolvió en buen estado',
    })
    @IsOptional()
    @IsString()
    returnNotes?: string;

    @ApiPropertyOptional({
        description: 'ID de la persona',
        example: 456,
    })
    @IsOptional()
    @IsInt()
    personId?: number;

    @ApiPropertyOptional({ description: 'ID de la sucursal', example: 789 })
    @IsOptional()
    @IsInt()
    branchId?: number;
}
