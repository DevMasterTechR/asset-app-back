import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StorageType } from '@prisma/client';

export class CreateStorageDto {
  @ApiProperty({
    description: 'ID del activo al que pertenece este almacenamiento',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty({
    description: 'Tipo de almacenamiento',
    enum: StorageType,
    example: StorageType.HDD,
    enumName: 'StorageType',
  })
  @IsEnum(StorageType)
  @IsNotEmpty()
  type: StorageType;

  @ApiProperty({
    description: 'Capacidad del almacenamiento en Gigabytes',
    example: 500,
    type: Number,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  capacityGb: number;

  @ApiProperty({
    description: 'Notas o comentarios adicionales sobre el almacenamiento',
    example: 'Disco duro secundario para respaldos',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}





