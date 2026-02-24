import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { EnquiryStatus, EnquiryType } from '../enquiry.schema';

export class AdminUpdateEnquiryDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsEnum(EnquiryType)
  enquiryType?: EnquiryType;

  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}
