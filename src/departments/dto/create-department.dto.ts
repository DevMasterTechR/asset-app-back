import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Recursos Humanos',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional del departamento',
    example: 'Departamento encargado de la gestión del personal',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
