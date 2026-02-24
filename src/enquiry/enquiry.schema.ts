import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnquiryDocument = Enquiry & Document;

/**
 * Enquiry Type Enum
 */
export enum EnquiryType {
  GENERAL_INQUIRY = 'General Inquiry',
  SCHEDULE_VIEWING = 'Schedule Viewing',
  PRICE_INFO = 'Price Information',
  REQUEST_CALLBACK = 'Request Callback',
}

/**
 * Enquiry Status Enum
 */
export enum EnquiryStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Schema({
  timestamps: true,
  collection: 'enquiries',
})
export class Enquiry {
  // 🔗 Buyer Reference
  @Prop({ type: Types.ObjectId, ref: 'Buyer', required: true })
  buyerId: Types.ObjectId;

  // 🔗 Agent Reference
  @Prop({
    type: Types.ObjectId,
    ref: 'Agent',
    required: true,
  })
  agentId: Types.ObjectId;

  // 🔗 Property Reference
  @Prop({
    type: Types.ObjectId,
    ref: 'Property',
    required: true,
  })
  propertyId: Types.ObjectId;

  // 👤 Contact Info
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  // 💰 Budget
  @Prop({ min: 0 })
  budget?: number;

  // 📌 Enquiry Type
  @Prop({
    type: String,
    enum: Object.values(EnquiryType),
    required: true,
  })
  enquiryType: EnquiryType;

  // 📝 Message
  @Prop({ trim: true })
  message?: string;

  // 📊 Status
  @Prop({
    type: String,
    enum: Object.values(EnquiryStatus),
    default: EnquiryStatus.OPEN,
  })
  status: EnquiryStatus;

  // ✅ Resolution
  @Prop({ default: false })
  isResolved: boolean;

  @Prop()
  resolvedAt?: Date;

  @Prop({ trim: true })
  resolutionNote?: string;

  // 🗑 Soft Delete
  @Prop({ default: null })
  deletedAt?: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
