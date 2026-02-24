// src/property-extras/property-extra.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PropertyCategory, NearbyPlace } from './property-extra.enums';

export type PropertyExtraDocument = HydratedDocument<PropertyExtra>;

@Schema({ timestamps: true })
export class PropertyExtra {

  /* 🔗 PROPERTY */
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true, unique: true })
  propertyId: Types.ObjectId;

  /* 🏠 PROPERTY CATEGORY */
  @Prop({
    type: String,
    enum: Object.values(PropertyCategory),
    required: true,
  })
  propertyCategory: PropertyCategory;

  /* 📍 NEARBY PLACES (MULTIPLE) */
  @Prop({
    type: [String],
    enum: Object.values(NearbyPlace),
    default: [],
  })
  nearbyPlaces: NearbyPlace[];
}

export const PropertyExtraSchema =
  SchemaFactory.createForClass(PropertyExtra);
