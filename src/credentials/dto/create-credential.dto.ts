import { IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
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
  @IsOptional()
  @IsString()
  @ValidateIf((o) => ['email', 'glpi', 'erp', 'crm'].includes(o.system))
  username?: string;

  @ApiPropertyOptional({
    description: 'Número telefónico asociado a la credencial',
    example: '+593991234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Contraseña asociada a la credencial',
    example: 'secureP@ss123',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => ['email', 'glpi', 'erp', 'crm'].includes(o.system))
  password?: string;

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
