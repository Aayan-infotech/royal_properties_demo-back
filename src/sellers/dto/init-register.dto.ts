import { IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEmail } from 'class-validator';

export class InitRegisterSellerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  location:string

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
  agencyName?: string;
}
