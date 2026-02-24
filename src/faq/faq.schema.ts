import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;

  @Prop({
    type: String,
    enum: ['buyer', 'seller', 'agent', 'all'],
    default: 'all',
  })
  audience: 'buyer' | 'seller' | 'agent' | 'all';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
