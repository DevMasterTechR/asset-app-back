import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { SimPlanType, SimStatus } from '@prisma/client';

export class CreateSimCardDto {
  @IsInt()
  assetId: number;

  @IsString()
  @IsNotEmpty()
  carrier: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(SimPlanType)
  planType: SimPlanType;

  @IsOptional()
  @IsEnum(SimStatus)
  status?: SimStatus;

  @IsOptional()
  @IsDateString()
  activationDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
