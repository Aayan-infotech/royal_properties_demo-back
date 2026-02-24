import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @MinLength(6)
  password: string;
}
