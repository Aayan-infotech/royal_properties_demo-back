import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BuyerDocument = Buyer & Document;

export type VerificationMethod = 'email' | 'phone' | null;

@Schema({ timestamps: true, collection: 'buyers' })
export class Buyer {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, trim: true })
  phoneNumber: string;

  @Prop()
  password?: string;

  @Prop({ type: String, enum: ['email', 'phone'], default: null })
  selectedVerificationMethod: VerificationMethod;

  @Prop({ default: false })
  isVerified: boolean;

  // new: set to true after OTP verification (before password)
  @Prop({ default: false })
  isOtpVerified?: boolean;

  @Prop({ type: String, enum: ['email', 'phone', null], default: null })
  verifiedBy: VerificationMethod;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  phoneVerifiedAt?: Date;

  @Prop()
  otpCode?: string;

  @Prop({ type: String, enum: ['email', 'phone', null], default: null })
  otpChannel?: VerificationMethod;

  @Prop()
  otpExpiresAt?: Date;

  // 🔐 hashed refresh token (optional)
  @Prop()
  hashedRefreshToken?: string;
}

export const BuyerSchema = SchemaFactory.createForClass(Buyer);
