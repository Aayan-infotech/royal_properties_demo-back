import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyBuyerOtpDto {
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @Length(4, 4)
  otp: string;
}
