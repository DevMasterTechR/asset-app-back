import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum PersonStatus {
  active = 'active',
  inactive = 'inactive',
  suspended = 'suspended',
}

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  username?: string;

@IsString()
@IsNotEmpty()
@MinLength(6)
password: string;


  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  roleId?: number;

  @IsOptional()
  @IsInt()
  branchId?: number;
}
