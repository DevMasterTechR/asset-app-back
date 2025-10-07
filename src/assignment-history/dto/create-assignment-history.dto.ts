import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Condition } from '@prisma/client';



export class CreateAssignmentHistoryDto {
  @IsInt()
  assetId: number;

  @IsInt()
  personId: number;

  @IsOptional()
  @IsInt()
  branchId?: number;

  @IsOptional()
  @IsDateString()
  assignmentDate?: Date;

  @IsOptional()
  @IsDateString()
  returnDate?: Date;

  @IsOptional()
  @IsEnum(Condition)
  deliveryCondition?: Condition;

  @IsOptional()
  @IsEnum(Condition)
  returnCondition?: Condition;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @IsOptional()
  @IsString()
  returnNotes?: string;
}
