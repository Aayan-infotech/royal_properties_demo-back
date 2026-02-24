import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['buyer', 'seller','agent'])
  role: 'buyer' | 'seller' | 'agent';
}
