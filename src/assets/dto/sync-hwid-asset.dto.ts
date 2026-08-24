import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Lo que manda hwid-server cuando HWIDApp guarda el responsable de un
// equipo: el código que ya le asignó HWIDApp (ej. "LAPT-406") es el código
// verdadero para ese activo — de ahí se crea o actualiza el Asset.
export class SyncHwidAssetDto {
    @ApiProperty({ description: 'Código asignado por HWIDApp (verdadero para este activo)', example: 'LAPT-406' })
    @IsString()
    @IsNotEmpty()
    assetCode: string;

    @ApiProperty({ description: 'Tipo de activo', example: 'Laptop' })
    @IsString()
    @IsNotEmpty()
    assetType: string;

    @ApiPropertyOptional({ description: 'Número de serie leído del hardware' })
    @IsOptional()
    @IsString()
    serialNumber?: string;

    @ApiPropertyOptional({ description: 'Marca leída del hardware' })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({ description: 'Modelo leído del hardware' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: 'Cédula del responsable guardado en HWIDApp' })
    @IsOptional()
    @IsString()
    cedula?: string;

    @ApiPropertyOptional({ description: 'Nombre de la sucursal guardada en HWIDApp' })
    @IsOptional()
    @IsString()
    sucursal?: string;

    @ApiPropertyOptional({ description: 'Resto de la ficha técnica (CPU, RAM, discos, etc.)', type: Object })
    @IsOptional()
    @IsObject()
    attributesJson?: Record<string, any>;
}
