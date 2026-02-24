import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetAgentPasswordDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @MinLength(6)
  password: string;
}
