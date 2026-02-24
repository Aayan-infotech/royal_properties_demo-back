import { IsNotEmpty, IsString } from 'class-validator';

export class ResendAgentOtpDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;
}
