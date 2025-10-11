import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PersonStatus {
    active = 'active',
    inactive = 'inactive',
    suspended = 'suspended',
}

export class CreatePersonDto {
    @ApiProperty({
        description: 'Número de identificación nacional',
        example: '1234567890',
    })
    @IsString()
    @IsNotEmpty()
    nationalId: string;

    @ApiProperty({
        description: 'Nombre de la persona',
        example: 'Juan',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Apellido de la persona',
        example: 'Pérez',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({
        description: 'Nombre de usuario (único)',
        example: 'juan.perez',
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({
        description: 'Contraseña de al menos 6 caracteres',
        example: 'securePass123',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        description: 'Estado de la persona',
        enum: PersonStatus,
        example: PersonStatus.active,
    })
    @IsOptional()
    @IsEnum(PersonStatus)
    status?: PersonStatus;

    @ApiPropertyOptional({
        description: 'ID del departamento al que pertenece la persona',
        example: 2,
    })
    @IsOptional()
    @IsInt()
    departmentId?: number;

    @ApiPropertyOptional({
        description: 'ID del rol asignado a la persona',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    roleId?: number;

    @ApiPropertyOptional({
        description: 'ID de la sucursal donde trabaja la persona',
        example: 3,
    })
    @IsOptional()
    @IsInt()
    branchId?: number;
}
