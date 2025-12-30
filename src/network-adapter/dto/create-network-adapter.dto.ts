import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateNetworkAdapterDto {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty({ required: false, description: 'Tipo: Ethernet a USB, WiFi USB, etc.' })
  @IsOptional()
  @IsString()
  adapterType?: string;

  @ApiProperty({ required: false, description: 'Velocidad: 10/100, Gigabit, etc.' })
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
