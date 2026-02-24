import { IsEmail } from 'class-validator';

export class ForgotSellerPasswordDto {
  @IsEmail()
  email: string;
}
