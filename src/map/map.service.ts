import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Property,
  PropertyDocument,
  ApprovalStatus,
} from '../property/property.schema';

@Injectable()
export class MapService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  private getGridSize(zoom: number): number {
    if (zoom <= 6) return 1;
    if (zoom <= 9) return 0.5;
    if (zoom <= 12) return 0.2;
    if (zoom <= 15) return 0.05;
    if (zoom <= 18) return 0.01;
    return 0;
  }

  async getMapData(lat: number, lon: number, zoom: number) {
    const gridSize = this.getGridSize(zoom);

    // 🔹 REAL PROPERTIES
    if (zoom >= 20) {
      const properties = await this.propertyModel.find(
        {
          isApprovalByAdmin: ApprovalStatus.APPROVED,
          propertyBLOCK: false,
          soldOut: false,
          'keyFacts.letLONG': { $exists: true },
        },
        {
          _id: 1,
          'keyFacts.letLONG': 1,
        },
      );

      return {
        type: 'properties',
        data: properties
          .filter(
            (p) =>
              p.keyFacts &&
              Array.isArray(p.keyFacts.letLONG) &&
              p.keyFacts.letLONG.length === 2,
          )
          .map((p) => ({
            propertyId: p._id,
            location: {
              lat: p.keyFacts!.letLONG![1],
              lon: p.keyFacts!.letLONG![0],
            },
          })),
      };
    }

    // 🔹 CLUSTER MODE
    const clusters = await this.propertyModel.aggregate([
      {
        $match: {
          isApprovalByAdmin: ApprovalStatus.APPROVED,
          propertyBLOCK: false,
          soldOut: false,
          'keyFacts.letLONG': { $exists: true },
        },
      },
      {
        $project: {
          lon: { $arrayElemAt: ['$keyFacts.letLONG', 0] },
          lat: { $arrayElemAt: ['$keyFacts.letLONG', 1] },
        },
      },
     {
      $match: {
        lat: { $ne: null },
        lon: { $ne: null },
      },
    },
      {
        $group: {
          _id: {
            lon: { $floor: { $divide: ['$lon', gridSize] } },
            lat: { $floor: { $divide: ['$lat', gridSize] } },
          },
          count: { $sum: 1 },
          avgLon: { $avg: '$lon' },
          avgLat: { $avg: '$lat' },
        },
      },
      {
        $project: {
          _id: 0,
          location: {
            lat: '$avgLat',
            lon: '$avgLon',
          },
          propertyCount: '$count',
        },
      },
    ]);

    return {
      type: 'clusters',
      data: clusters,
    };
  }

  async getSinglePropertyByLocation(propertyId: string, letLONG: number[]) {
    const property = await this.propertyModel.findOne(
      {
        _id: new Types.ObjectId(propertyId),
        isApprovalByAdmin: ApprovalStatus.APPROVED,
        'keyFacts.letLONG': letLONG, // ✅ match same lat-long
        propertyBLOCK: false,
        soldOut: false,
      },
      {
        property: 1,
        price: 1,
        address: 1,
        photos: { $slice: 3 },
        'keyFacts.letLONG': 1,
      },
    );

    if (!property) {
      throw new NotFoundException('Property not found or not approved');
    }

    return {
      propertyId: property._id,
      letLONG: property.keyFacts?.letLONG,
      property: property.property,
      price: property.price,
      address: property.address,
      photos: property.photos || [],
    };
  }
}
