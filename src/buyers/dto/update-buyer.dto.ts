import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateBuyerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
