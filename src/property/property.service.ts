import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Property, PropertyDocument, Media } from './property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    dto: CreatePropertyDto,
    sellerId: string, // 🔑 FROM TOKEN
    images?: Express.Multer.File[],
    video?: Express.Multer.File,
  ) {
    try {
      /* ================= VALIDATE sellerId ================= */
      if (!Types.ObjectId.isValid(sellerId)) {
        throw new BadRequestException({
          message: 'Invalid seller id',
          field: 'sellerId',
        });
      }

      /* ================= MEDIA SIZE CHECK ================= */
      const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
      const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB

      if (images?.length) {
        const largeImages = images.filter((img) => img.size > MAX_IMAGE_SIZE);

        if (largeImages.length) {
          throw new BadRequestException({
            message: 'Each image size must be less than or equal to 2 MB',
            field: 'images',
          });
        }
      }

      if (video && video.size > MAX_VIDEO_SIZE) {
        throw new BadRequestException({
          message: 'Video size must be less than or equal to 10 MB',
          field: 'video',
        });
      }

      /* ================= MEDIA ================= */
      const photos: Media[] = [];
      const videos: Media[] = [];

      if (images?.length) {
        const uploads = await this.s3Service.uploadMultiple(
          images,
          'properties/images',
        );

        photos.push(
          ...uploads.map((u) => ({
            url: u.url,
            type: 'image' as const,
          })),
        );
      }

      if (video) {
        const upload = await this.s3Service.uploadFile(
          video,
          'properties/videos',
        );

        videos.push({
          url: upload.url,
          type: 'video' as const,
        });
      }

      /* ================= AGENT IDS SAFETY ================= */
      if (dto.agentIds?.length) {
        const invalidAgentIds = dto.agentIds.filter(
          (id) => !Types.ObjectId.isValid(id),
        );

        if (invalidAgentIds.length) {
          throw new BadRequestException({
            message: 'Invalid agentIds provided',
            field: 'agentIds',
            invalidValues: invalidAgentIds,
          });
        }
      }

      /* ================= CREATE DOCUMENT ================= */
      const property = new this.propertyModel({
        ...dto,
        sellerId: new Types.ObjectId(sellerId),
        agentIds: dto.agentIds?.map((id) => new Types.ObjectId(id)),
        photos,
        videos,
      });

      return await property.save();
    } catch (error) {
      /* ================= DUPLICATE KEY ================= */
      if (error?.code === 11000) {
        throw new BadRequestException({
          message: 'Duplicate field value',
          field: Object.keys(error.keyValue || {}),
        });
      }

      /* ================= KNOWN ERRORS ================= */
      if (error instanceof BadRequestException) {
        throw error;
      }

      /* ================= FALLBACK ================= */
      throw new InternalServerErrorException({
        message: 'Failed to create property',
      });
    }
  }

  /* ================= GET ALL ================= */
  async findAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const match: any = {};

    /* 🔍 PROPERTY SEARCH */
    if (search && search.trim()) {
      match.$or = [
        { address: { $regex: search, $options: 'i' } },
        { property: { $regex: search, $options: 'i' } },
      ];
    }

    /* ================= FETCH PROPERTIES ================= */
    let data: any[] = await this.propertyModel
      .find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ================= SELLER IDS ================= */
    const sellerObjectIds = data
      .map((item) => item.sellerId)
      .filter((id) => Types.ObjectId.isValid(id));

    const sellers = sellerObjectIds.length
      ? await this.propertyModel.db
          .collection('sellers')
          .find({
            _id: {
              $in: sellerObjectIds.map((id) => new Types.ObjectId(id)),
            },
          })
          .project({ _id: 1, fullName: 1 })
          .toArray()
      : [];

    const sellerMap = new Map(sellers.map((s: any) => [s._id.toString(), s]));

    /* ================= AGENT IDS ================= */
    const agentObjectIds = data
      .flatMap((item) => item.agentIds || [])
      .filter((id) => Types.ObjectId.isValid(id));

    const agents = agentObjectIds.length
      ? await this.propertyModel.db
          .collection('agents')
          .find({
            _id: {
              $in: agentObjectIds.map((id) => new Types.ObjectId(id)),
            },
          })
          .project({ _id: 1, name: 1, email: 1 })
          .toArray()
      : [];

    const agentMap = new Map(agents.map((a: any) => [a._id.toString(), a]));

    /* ================= ATTACH SELLER & AGENTS ================= */
    data = data.map((item) => {
      const result: any = { ...item };

      // ✅ sellerId populated
      if (Types.ObjectId.isValid(item.sellerId)) {
        result.sellerId = sellerMap.get(item.sellerId.toString()) || null;
      }

      // ✅ agentIds populated
      if (Array.isArray(item.agentIds)) {
        result.agentIds = item.agentIds
          .map((id) => agentMap.get(id.toString()) || id)
          .filter(Boolean);
      }

      return result;
    });

    /* ================= PAGINATION ================= */
    const total = await this.propertyModel.countDocuments(match);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ================= GET ONE ================= */
  async findOne(id: string) {
    const property = await this.propertyModel
      .findById(id)
      .populate({
        path: 'sellerId',
        select: '_id fullName',
      })
      .populate({
        path: 'agentIds',
        select: '_id fullName',
      });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  /* ================= UPDATE ================= */
  async update(
    id: string,
    dto: UpdatePropertyDto,
    images?: Express.Multer.File[],
    video?: Express.Multer.File,
  ) {
    const property = await this.findOne(id);

    property.photos = property.photos ?? [];
    property.videos = property.videos ?? [];

    if (images?.length) {
      const uploads = await this.s3Service.uploadMultiple(
        images,
        'properties/images',
      );

      property.photos.push(
        ...uploads.map((u) => ({
          url: u.url,
          type: 'image' as const,
        })),
      );
    }

    if (video) {
      // delete old videos
      for (const v of property.videos) {
        await this.s3Service.deleteFile(this.extractKey(v.url));
      }

      const upload = await this.s3Service.uploadFile(
        video,
        'properties/videos',
      );

      property.videos = [
        {
          url: upload.url,
          type: 'video' as const,
        },
      ];
    }

    Object.assign(property, dto);
    return property.save();
  }

  /* ================= DELETE ================= */
  async remove(id: string) {
    const property = await this.findOne(id);

    property.photos = property.photos ?? [];
    property.videos = property.videos ?? [];

    for (const p of property.photos) {
      await this.s3Service.deleteFile(this.extractKey(p.url));
    }

    for (const v of property.videos) {
      await this.s3Service.deleteFile(this.extractKey(v.url));
    }

    await property.deleteOne();
    return { deleted: true };
  }

  /* ================= DELETE SINGLE MEDIA ================= */
  async deleteMedia(propertyId: string, mediaId: string) {
    const property = await this.findOne(propertyId);

    // ✅ Make TS happy
    property.photos = property.photos ?? [];
    property.videos = property.videos ?? [];

    const mediaObjectId = new Types.ObjectId(mediaId);

    /* ================= PHOTOS ================= */
    const photoIndex = property.photos.findIndex(
      (p) => p._id?.toString() === mediaObjectId.toString(),
    );

    if (photoIndex > -1) {
      const photo = property.photos[photoIndex];

      await this.s3Service.deleteFile(this.extractKey(photo.url));

      property.photos.splice(photoIndex, 1);
      await property.save();

      return { deleted: true, type: 'image' };
    }

    /* ================= VIDEOS ================= */
    const videoIndex = property.videos.findIndex(
      (v) => v._id?.toString() === mediaObjectId.toString(),
    );

    if (videoIndex > -1) {
      const video = property.videos[videoIndex];

      await this.s3Service.deleteFile(this.extractKey(video.url));

      property.videos.splice(videoIndex, 1);
      await property.save();

      return { deleted: true, type: 'video' };
    }

    throw new NotFoundException('Media not found in this property');
  }
  /* ================= get Agent ================= */
  async findByAgentId(
    agentId: string,
    options: { page: number; limit: number; search?: string },
  ) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const match: any = {
      agentIds: agentId, // ✅ STRING MATCH
    };

    if (search) {
      match.$or = [
        { address: { $regex: search, $options: 'i' } },
        { property: { $regex: search, $options: 'i' } },
      ];
    }

    // console.log('PROPERTY MATCH QUERY:', match);

    const data = await this.propertyModel
      .find(match)
      .populate({ path: 'sellerId', select: '_id fullName' })
      // .populate({ path: 'agentIds', select: '_id fullName' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.propertyModel.countDocuments(match);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ================= getApprovedProperties  ================= */

  async getApprovedProperties(options: {
    page: number;
    limit: number;
    search?: string;
    propertyCategory?: string;
    nearbyPlaces?: string;
  }) {
    const { page, limit, search, propertyCategory, nearbyPlaces } = options;
    const skip = (page - 1) * limit;

    const match: any = {
      isApprovalByAdmin: 'approved',
    };

    // 🔍 SEARCH
    if (search) {
      match.$or = [
        { property: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const nearbyArray = nearbyPlaces
      ? nearbyPlaces.split(',').map((v) => v.trim())
      : [];

    const pipeline: any[] = [
      { $match: match },

      /* 🔗 PROPERTY EXTRAS */
      {
        $lookup: {
          from: 'propertyextras',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'propertyExtras',
        },
      },
      {
        $addFields: {
          propertyExtras: {
            $ifNull: [{ $arrayElemAt: ['$propertyExtras', 0] }, {}],
          },
        },
      },
    ];

    /* 🏠 FILTER BY CATEGORY */
    if (propertyCategory) {
      pipeline.push({
        $match: {
          'propertyExtras.propertyCategory': propertyCategory,
        },
      });
    }

    /* 📍 FILTER BY NEARBY PLACES */
    if (nearbyArray.length > 0) {
      pipeline.push({
        $match: {
          'propertyExtras.nearbyPlaces': { $in: nearbyArray },
        },
      });
    }

    /* ✅ CONVERT agentIds STRING → ObjectId */
    pipeline.push({
      $addFields: {
        agentObjectIds: {
          $map: {
            input: '$agentIds',
            as: 'agentId',
            in: { $toObjectId: '$$agentId' },
          },
        },
      },
    });

    /* 📦 SORT + PAGINATION */
    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },

            /* 👤 SELLER */
            {
              $lookup: {
                from: 'sellers',
                localField: 'sellerId',
                foreignField: '_id',
                as: 'sellerId',
              },
            },
            {
              $unwind: {
                path: '$sellerId',
                preserveNullAndEmptyArrays: true,
              },
            },

            /* 🧑‍💼 AGENTS (FIXED) */
            {
              $lookup: {
                from: 'agents',
                localField: 'agentObjectIds',
                foreignField: '_id',
                as: 'agentIds',
              },
            },

            /* ❌ REMOVE TEMP FIELD */
            {
              $project: {
                agentObjectIds: 0,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    );

    const result = await this.propertyModel.aggregate(pipeline);

    const data = result[0]?.data ?? [];
    const total = result[0]?.total?.[0]?.count ?? 0;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ================= Get by Seller id   ================= */
  async findBySellerId(
    sellerId: string, // 🔑 comes from JWT (req.user.userId)
    options: { page: number; limit: number; search?: string },
  ) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const match: any = {
      sellerId: new Types.ObjectId(sellerId), // ✅ FIXED
    };

    // 🔍 SEARCH
    if (search) {
      match.$or = [
        { property: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await this.propertyModel
      .find(match)
      .select('-agentIds') // ✅ hide agentIds
      .populate({
        path: 'sellerId',
        select: '_id fullName email',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.propertyModel.countDocuments(match);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ================= UTIL ================= */
  private extractKey(url: string): string {
    return url.split('.com/')[1];
  }
}
