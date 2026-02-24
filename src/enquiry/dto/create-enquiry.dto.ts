import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  Min,
  IsMongoId,
} from 'class-validator';
import { EnquiryType } from '../enquiry.schema';

export class CreateEnquiryDto {
  @IsNotEmpty()
  @IsEnum(EnquiryType)
  enquiryType: EnquiryType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsString()
  agentId: string;

  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;
}
