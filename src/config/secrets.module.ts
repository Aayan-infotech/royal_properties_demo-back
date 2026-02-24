import { Module } from '@nestjs/common';
import { AwsSecretsService } from './aws-secrets.service';

@Module({
  providers: [AwsSecretsService],
  exports: [AwsSecretsService], 
})
export class SecretsModule {}
