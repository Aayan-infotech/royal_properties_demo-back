import { IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEmail } from 'class-validator';

export class InitRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN') // 
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['email', 'phone'])
  verificationMethod: 'email' | 'phone';
}
