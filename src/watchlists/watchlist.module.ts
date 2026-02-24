import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

import { Watchlist, WatchlistSchema } from './watchlist.schema';
import { Property, PropertySchema } from '../property/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Watchlist.name, schema: WatchlistSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistsModule {}
