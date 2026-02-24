import { IsNotEmpty, IsString } from 'class-validator';

export class ResendSellerOtpDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;
}
