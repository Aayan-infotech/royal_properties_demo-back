import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyAgentOtpDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @Length(4, 4)
  otp: string;
}
