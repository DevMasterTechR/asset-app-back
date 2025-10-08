import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SystemType } from '@prisma/client';

export class CreateCredentialDto {
  @ApiProperty({
    description: 'ID de la persona a la que pertenece esta credencial',
    example: 42,
  })
  @IsInt()
  personId: number;

  @ApiProperty({
    description: 'Nombre de usuario para el acceso al sistema',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Contraseña asociada a la credencial',
    example: 'secureP@ss123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Sistema al que pertenece esta credencial',
    enum: SystemType,
    example: SystemType.crm, // Asegúrate que este valor exista en tu enum
  })
  @IsEnum(SystemType)
  system: SystemType;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la credencial',
    example: 'Esta cuenta tiene permisos de administrador.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
