import { IsString, IsOptional, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsIn(['buyer', 'seller', 'agent', 'all'])
  audience?: 'buyer' | 'seller' | 'agent' | 'all';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
