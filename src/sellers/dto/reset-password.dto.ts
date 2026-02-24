import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetSellerPasswordDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
