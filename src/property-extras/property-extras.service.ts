import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PropertyExtra, PropertyExtraDocument } from './property-extra.schema';
import { PropertyExtraDto } from './dto/property-extra.dto';

@Injectable()
export class PropertyExtrasService {
  constructor(
    @InjectModel(PropertyExtra.name)
    private readonly model: Model<PropertyExtraDocument>,
  ) {}

  /* CREATE OR UPDATE */
  upsert(dto: PropertyExtraDto) {
    return this.model.findOneAndUpdate(
      { propertyId: new Types.ObjectId(dto.propertyId) },
      {
        propertyCategory: dto.propertyCategory,
        nearbyPlaces: dto.nearbyPlaces,
      },
      { new: true, upsert: true },
    );
  }

  /* GET BY PROPERTY */
  async getByProperty(propertyId: string) {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestException('Invalid propertyId');
    }

    return await this.model
      .findOne({ propertyId: new Types.ObjectId(propertyId) })
      .lean();
  }
}
