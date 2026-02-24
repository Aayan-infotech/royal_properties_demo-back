import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  agencyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyIds?: string[]; // can be cast to ObjectId later

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
