import { IsOptional, IsEnum, IsNumberString, IsString } from 'class-validator';
import { EnquiryStatus, EnquiryType } from '../enquiry.schema';

export class AdminGetEnquiriesDto {
  @IsOptional()
  @IsEnum(EnquiryType)
  enquiryType?: EnquiryType;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
