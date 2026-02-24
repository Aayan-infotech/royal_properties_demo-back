import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SecretsModule } from '../config/secrets.module';

@Module({
  imports: [SecretsModule], 
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
