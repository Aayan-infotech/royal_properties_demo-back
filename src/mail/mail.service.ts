import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AwsSecretsService } from '../config/aws-secrets.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  // ✅ DEFINE secretsService here
  constructor(private readonly secretsService: AwsSecretsService) {}

  // ✅ DEFINE getTransporter method
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const secrets = await this.secretsService.getSecrets();

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: secrets.SMTP_USER,
        pass: secrets.SMTP_PASS,
      },
    });
    return this.transporter;
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      const secrets = await this.secretsService.getSecrets();
      const transporter = await this.getTransporter();

      await transporter.sendMail({
        from: `"Royal Properties" <${secrets.SMTP_USER}>`,
        to,
        subject: 'Your OTP Code',
        html: `
          <h2>Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        `,
      });
    } catch (err) {
      console.error('Email error:', err);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
