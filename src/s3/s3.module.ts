import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { SecretsModule } from '../config/secrets.module';

@Module({
  imports: [SecretsModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
