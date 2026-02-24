import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PropertyDocument = HydratedDocument<Property>;

/* ======================================================
   ENUMS
====================================================== */

export enum ApprovalStatus {
  PENDING = 'approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/* ======================================================
   MEDIA (Photo / Video) – Each has unique _id
====================================================== */

@Schema({ _id: true })
export class Media {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ enum: ['image', 'video'], required: true })
  type: 'image' | 'video';

  @Prop({ default: Date.now })
  uploadedAt?: Date;
}

/* ======================================================
   KEY FACTS
====================================================== */

@Schema({ _id: false })
export class KeyFacts {
  @Prop() propertyType?: string;
  @Prop() yearBuilt?: number;
  @Prop() size?: string; // e.g. 1200 sqft
  @Prop() pricePerSqft?: number;
  @Prop() lotSize?: string;
  @Prop() parking?: string;

  @Prop({ default: Date.now })
  addedToRoyalProperties?: Date;

  @Prop({ default: Date.now })
  lastUpdatedOn?: Date;

  @Prop({ type: [Number], default: [] })
  letLONG?: number[]; // [lat, long]
}

/* ======================================================
   PROPERTY DETAILS
====================================================== */

@Schema({ _id: false })
export class PropertyDetails {
  @Prop() municipality?: string;
  @Prop() roomsAboveGrade?: number;
  @Prop() bedrooms?: number;
  @Prop() bedroomsAboveGrade?: number;
  @Prop() fullBathrooms?: number;
  @Prop() halfBathrooms?: number;
  @Prop() fireplace?: boolean;
  @Prop() basement?: string;
  @Prop() basementDevelopment?: string;
  @Prop() additionalRooms?: string;
  @Prop() buildingAge?: string;
  @Prop() constructionType?: string;
  @Prop() exteriorFeature?: string;
  @Prop() parkingFeatures?: string;
}

/* ======================================================
   ROOMS
====================================================== */

@Schema({ _id: false })
export class Room {
  @Prop() name?: string; // Living Room, Bedroom
  @Prop() size?: string; // 3.5 x 5 m
  @Prop() level?: string; // Main, Basement
}

@Schema({ _id: false })
export class Rooms {
  @Prop({ type: [Room], default: [] })
  items?: Room[];
}

/* ======================================================
   MAIN PROPERTY SCHEMA
====================================================== */

@Schema({ timestamps: true })
export class Property {
  @Prop({ type: Types.ObjectId, ref: 'Seller' })
  sellerId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Agent', default: [] })
  agentIds?: Types.ObjectId[]; // MULTIPLE AGENTS

  @Prop() property?: string; // Property title/name

  @Prop() price?: number;

  /* -------- MEDIA -------- */

  @Prop({ type: [Media], default: [] })
  photos?: Media[];

  @Prop({ type: [Media], default: [] })
  videos?: Media[];

  /* -------- STATUS -------- */

  @Prop({
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING,
  })
  isApprovalByAdmin?: ApprovalStatus;

  @Prop({ unique: true, sparse: true })
  skuId?: string;

  @Prop({ default: false })
  soldOut?: boolean;

  @Prop({ default: false })
  propertyBLOCK?: boolean;

  /* -------- LOCATION -------- */

  @Prop() address?: string;

  /* -------- META -------- */

  @Prop({ type: KeyFacts, default: {} })
  keyFacts?: KeyFacts;

  @Prop({ type: PropertyDetails, default: {} })
  details?: PropertyDetails;

  @Prop({ type: Rooms, default: {} })
  rooms?: Rooms;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
