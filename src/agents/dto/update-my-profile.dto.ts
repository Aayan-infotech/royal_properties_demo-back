import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  boardName?: string;

  @IsOptional()
  @IsString()
  brokerageName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  province?: string;
}
