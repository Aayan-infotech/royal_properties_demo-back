import { IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEmail } from 'class-validator';

export class InitRegisterAgentDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['email', 'phone'])
  verificationMethod: 'email' | 'phone';

  @IsOptional()
  @IsString()
  brokerageName?: string;

  @IsOptional()
  @IsString()
  boardName?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  @IsNotEmpty()
  location?: string;
}
