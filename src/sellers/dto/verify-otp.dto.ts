import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifySellerOtpDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @Length(4, 4)
  otp: string;
}
