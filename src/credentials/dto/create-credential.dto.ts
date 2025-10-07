import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SystemType } from '@prisma/client';

export class CreateCredentialDto {
  @IsInt()
  personId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(SystemType)
  system: SystemType;

  @IsOptional()
  @IsString()
  notes?: string;
}
