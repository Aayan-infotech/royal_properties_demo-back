import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetSellerPasswordDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @MinLength(6)
  password: string;
}
