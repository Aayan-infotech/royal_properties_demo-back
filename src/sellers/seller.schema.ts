import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerDocument = Seller & Document;
export type VerificationMethod = 'email' | 'phone' | null;

@Schema({ timestamps: true, collection: 'sellers' })
export class Seller {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: false, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, trim: true })
  phoneNumber: string;

  // optional until set
  @Prop()
  password?: string;

  @Prop({ trim: true })
  agencyName?: string;

  @Prop({ trim: true })
  city?: string;

  // OTP & verification fields (same as buyer)
  @Prop({ type: String, enum: ['email', 'phone'], default: null })
  selectedVerificationMethod: VerificationMethod;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isOtpVerified?: boolean;

  @Prop({ type: String, enum: ['email', 'phone', null], default: null })
  verifiedBy: VerificationMethod;

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

  // hashed refresh token
  @Prop()
  hashedRefreshToken?: string;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
