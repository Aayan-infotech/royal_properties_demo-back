import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
