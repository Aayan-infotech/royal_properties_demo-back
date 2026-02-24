import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EnquiryStatus } from '../enquiry.schema';

export class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status: EnquiryStatus;

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}
