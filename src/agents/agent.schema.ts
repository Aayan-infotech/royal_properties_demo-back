import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;
export type VerificationMethod = 'email' | 'phone' | null;

@Schema({ timestamps: true, collection: 'agents' })
export class Agent {
  @Prop({ required: true, trim: true })
  fullName: string;

  // 🔥 IMPORTANT: sparse true
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

 @Prop({ unique: true, sparse: true, trim: true })
 phoneNumber?: string;

  @Prop()
  password?: string;

  @Prop({ trim: true })
  province?: string;

  @Prop({ trim: true })
  boardName?: string;

  @Prop({ trim: true })
  brokerageName?: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ type: String, enum: ['email', 'phone'], default: null })
  selectedVerificationMethod: VerificationMethod;

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

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop()
  otpExpiresAt?: Date;

  @Prop()
  hashedRefreshToken?: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
