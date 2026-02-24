import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Watchlist, WatchlistDocument } from './watchlist.schema';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { Property } from '../property/property.schema';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectModel(Watchlist.name)
    private watchlistModel: Model<WatchlistDocument>,

    @InjectModel(Property.name)
    private propertyModel: Model<Property>,
  ) {}

  // ✅ ADD TO WATCHLIST (NO INDEX LOGIC)
  async addToWatchlist(buyerId: string, dto: CreateWatchlistDto) {
    // 1️⃣ Check property exists
    const propertyExists = await this.propertyModel.exists({
      _id: dto.propertyId,
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    // 2️⃣ Check already in watchlist
    const alreadyAdded = await this.watchlistModel.findOne({
      buyerId: new Types.ObjectId(buyerId),
      propertyId: new Types.ObjectId(dto.propertyId),
    });

    if (alreadyAdded) {
      throw new BadRequestException('Property already added to your watchlist');
    }

    // 3️⃣ Save
    const watchlist = await this.watchlistModel.create({
      buyerId: new Types.ObjectId(buyerId),
      propertyId: new Types.ObjectId(dto.propertyId),
    });

    return {
      success: true,
      message: 'Property added to watchlist successfully',
      data: watchlist,
    };
  }

  // ✅ GET BUYER WATCHLIST
  async getMyWatchlist(buyerId: string) {
    const list = await this.watchlistModel
      .find({
        buyerId: new Types.ObjectId(buyerId), // ✅ IMPORTANT FIX
      })
      .populate({
        path: 'propertyId',
        select: 'property price address photos keyFacts',
      })
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: list.length
        ? 'Watchlist fetched successfully'
        : 'Your watchlist is empty',
      total: list.length,
      data: list,
    };
  }

  // ✅ HARD DELETE
  async removeFromWatchlist(buyerId: string, watchlistId: string) {
    const deleted = await this.watchlistModel.findOneAndDelete({
      _id: watchlistId,
      buyerId: new Types.ObjectId(buyerId),
    });

    if (!deleted) {
      throw new NotFoundException('Watchlist item not found or not authorized');
    }

    return {
      success: true,
      message: 'Property removed from watchlist successfully',
    };
  }
}
