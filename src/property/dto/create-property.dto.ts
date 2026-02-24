import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsBoolean,
  IsEnum,
} from 'class-validator';

import { ApprovalStatus } from '../property.schema';

export class CreatePropertyDto {
  @IsOptional()
  @IsArray()
  agentIds?: string[];

  @IsOptional()
  @IsString()
  property?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  keyFacts?: any;

  @IsOptional()
  @IsObject()
  details?: any;

  @IsOptional()
  @IsObject()
  rooms?: any;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  isApprovalByAdmin?: ApprovalStatus;

  @IsOptional()
  @IsBoolean()
  propertyBLOCK?: boolean;
}
