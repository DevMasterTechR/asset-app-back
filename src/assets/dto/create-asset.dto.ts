import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssetStatus {
    available = 'available',
    assigned = 'assigned',
    maintenance = 'maintenance',
    decommissioned = 'decommissioned',
}
export class CreateAssetDto {
    @ApiProperty({ description: 'Código único del activo', example: 'A12345' })
    @IsString()
    @IsNotEmpty()
    assetCode: string;

    @ApiProperty({ description: 'Tipo de activo', example: 'Laptop' })
    @IsString()
    @IsNotEmpty()
    assetType: string;

    @ApiPropertyOptional({ description: 'Número de serie del activo', example: 'SN1234567890' })
    @IsOptional()
    @IsString()
    serialNumber?: string;

    @ApiPropertyOptional({ description: 'Marca del activo', example: 'Dell' })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({ description: 'Modelo del activo', example: 'XPS 13' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ enum: AssetStatus, description: 'Estado del activo' })
    @IsOptional()
    @IsEnum(AssetStatus)
    status?: AssetStatus;

    @ApiPropertyOptional({ description: 'ID de la sucursal asociada', example: 1 })
    @IsOptional()
    @IsInt()
    branchId?: number;

    @ApiPropertyOptional({ description: 'ID de la persona asignada', example: 10 })
    @IsOptional()
    @IsInt()
    assignedPersonId?: number;

    @ApiPropertyOptional({ description: 'Fecha de compra', example: '2024-01-15T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de entrega', example: '2024-02-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de recepción', example: '2024-02-10T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    receivedDate?: string;

    @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Activo en buen estado' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        description: 'Atributos adicionales en formato JSON',
        type: Object,
        example: { color: 'red', warranty: '2 years' },
    })
    @IsOptional()
    attributesJson?: Record<string, any>;
}
