import { IsString, MinLength } from 'class-validator';

export class ForceChangePasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}
