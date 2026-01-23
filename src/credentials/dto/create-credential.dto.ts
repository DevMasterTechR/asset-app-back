import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
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
    description: 'Nombre de usuario / email para sistemas que lo requieren',
    example: 'johndoe@empresa.com',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.system !== SystemType.tefl)
  @IsNotEmpty({ message: 'El usuario es obligatorio para este sistema' })
  username?: string;

  @ApiProperty({
    description: 'Contraseña para sistemas que lo requieren',
    example: 'secureP@ss123',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.system !== SystemType.tefl)
  @IsNotEmpty({ message: 'La contraseña es obligatoria para este sistema' })
  password?: string;

  @ApiProperty({
    description: 'Sistema al que pertenece esta credencial',
    enum: SystemType,
    example: SystemType.crm,
  })
  @IsEnum(SystemType)
  system: SystemType;

  @ApiPropertyOptional({
    description: 'Número telefónico (principalmente para TEFL)',
    example: '+593991234567 o 0962598491',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.system === SystemType.tefl)
  @IsNotEmpty({ message: 'El número telefónico es obligatorio para TEFL' })
  @Matches(/^(?:\+?593|0)[2-9][0-9]{7,8}$/, {
    message:
      'Formato de teléfono inválido. Usa formatos válidos ecuatorianos (ej: 0962598491, +593962598491, 022345678)',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la credencial',
    example: 'Esta cuenta tiene permisos de administrador.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}