import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { EnquiryStatus } from '../enquiry.schema';

export class GetAgentEnquiriesDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsNumberString()
  page?: string;  

  @IsOptional()
  @IsNumberString()
  limit?: string; 
}
