import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nombre único del rol',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Rol con acceso completo al sistema',
    description: 'Descripción del rol',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
