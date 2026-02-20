import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateUsbDto {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty({ required: false, description: 'Capacidad en GB' })
  @IsOptional()
  @IsInt()
  capacityGb?: number;

  @ApiProperty({ required: false, description: 'Tipo de USB: USB 2.0, USB 3.0, USB-C' })
  @IsOptional()
  @IsString()
  usbType?: string;

  @ApiProperty({ required: false, description: 'Velocidad de transferencia' })
  @IsOptional()
  @IsString()
  speed?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  usageDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
