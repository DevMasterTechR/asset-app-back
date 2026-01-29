import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AssetStatus } from './create-asset.dto';

export class BulkCreateAssetItemDto {
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

    @ApiPropertyOptional({ description: 'Fecha de compra', example: '2024-01-15' })
    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de entrega', example: '2024-01-20' })
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de recepción', example: '2024-01-25' })
    @IsOptional()
    @IsDateString()
    receivedDate?: string;

    @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Activo en buen estado' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Atributos JSON del activo', example: { cpu: 'Intel i7', ram: '16GB' } })
    @IsOptional()
    attributesJson?: Record<string, string | number | boolean>;
}

export class BulkCreateAssetDto {
    @ApiProperty({ description: 'Cantidad de dispositivos a crear', example: 5 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({ type: BulkCreateAssetItemDto, description: 'Plantilla con los datos base para todos los dispositivos' })
    @ValidateNested()
    @Type(() => BulkCreateAssetItemDto)
    template: BulkCreateAssetItemDto;
}
