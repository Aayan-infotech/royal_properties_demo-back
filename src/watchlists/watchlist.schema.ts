import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WatchlistDocument = HydratedDocument<Watchlist>;

@Schema({ timestamps: true })
export class Watchlist {
  @Prop({
    type: Types.ObjectId,
    ref: 'Buyer',
    required: true,
  })
  buyerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Property',
    required: true,
  })
  propertyId: Types.ObjectId;
}

export const WatchlistSchema =
  SchemaFactory.createForClass(Watchlist);
