import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterBuyerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('IN')
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  // client chooses which to verify: 'email' OR 'phone'
  @IsString()
  @IsIn(['email', 'phone'])
  verificationMethod: 'email' | 'phone';

  // optional, if you want any extra fields later
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}
