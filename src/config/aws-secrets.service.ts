import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export interface AppSecrets {
  MONGODB_URI?: string;

  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  AWS_ACCESS_KEY?: string;
  AWS_SECRET_KEY?: string;
}

@Injectable()
export class AwsSecretsService {
  private readonly logger = new Logger(AwsSecretsService.name);

  // 🔥 FIX: remove ?
  private cache: AppSecrets | null = null;

  private client = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  async getSecrets(): Promise<AppSecrets> {
    /**
     * ✅ LOCAL / DOCKER MODE
     */
    if (
      process.env.MONGODB_URI ||
      process.env.SMTP_HOST ||
      process.env.AWS_S3_BUCKET
    ) {
      this.logger.log('⚙️ Using environment variables');

      return {
        MONGODB_URI: process.env.MONGODB_URI,

        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT || '587',
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,

        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
      };
    }

    /**
     * ✅ AWS SECRETS MANAGER (cached)
     */
    if (this.cache) {
      return this.cache;
    }

    this.logger.log('🔐 Using AWS Secrets Manager');

    const response = await this.client.send(
      new GetSecretValueCommand({
        SecretId: 'royal-secret',
      }),
    );

    if (!response.SecretString) {
      throw new Error('AWS SecretString is empty');       
    }

    const secrets = JSON.parse(response.SecretString) as AppSecrets;

    // 🔥 cache is guaranteed to exist now
    this.cache = secrets;

    return secrets;
  }
}

