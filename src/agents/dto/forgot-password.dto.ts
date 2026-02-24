import { IsEmail } from 'class-validator';

export class ForgotAgentPasswordDto {
  @IsEmail()
  email: string;
}
