import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['buyer', 'seller','agent'])
  role: 'buyer' | 'seller'| 'agent';
}
