import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetAgentPasswordDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
