import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

export class UpdateAgentDto {
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
  location?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  boardName?: string;

  @IsOptional()
  @IsString()
  brokerageName?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
