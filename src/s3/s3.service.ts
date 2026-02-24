import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { AwsSecretsService } from '../config/aws-secrets.service';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly secretsService: AwsSecretsService) {}

  private async init() {
    if (this.s3) return;

    const secrets = await this.secretsService.getSecrets();

    if (
      !secrets.AWS_ACCESS_KEY ||
      !secrets.AWS_SECRET_KEY ||
      !secrets.AWS_S3_BUCKET
    ) {
      throw new InternalServerErrorException(
        'AWS S3 credentials missing in secrets',
      );
    }

    this.bucket = secrets.AWS_S3_BUCKET;

    this.s3 = new S3Client({
      region: secrets.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: secrets.AWS_ACCESS_KEY,
        secretAccessKey: secrets.AWS_SECRET_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads') {
    await this.init();

    const key = `${folder}/${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
    };
  }

  async uploadMultiple(files: Express.Multer.File[], folder = 'uploads') {
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  async deleteFile(key: string) {
    await this.init();

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return { deleted: true };
  }

  async deleteMultiple(keys: string[]) {
    return Promise.all(keys.map((key) => this.deleteFile(key)));
  }
}
