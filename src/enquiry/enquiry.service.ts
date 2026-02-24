import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enquiry, EnquiryDocument } from './enquiry.schema';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { GetAgentEnquiriesDto } from './dto/get-agent-enquiries.dto';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto';
import { EnquiryStatus } from './enquiry.schema';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name)
    private readonly enquiryModel: Model<EnquiryDocument>,
  ) {}
  async createEnquiry(buyerId: string, dto: CreateEnquiryDto) {
    if (!Types.ObjectId.isValid(dto.agentId)) {
      throw new BadRequestException('Invalid agentId');
    }

    try {
      const enquiry = new this.enquiryModel({
        buyerId: new Types.ObjectId(buyerId), // 🔐 from JWT
        agentId: new Types.ObjectId(dto.agentId), // 📩 manual
        propertyId: new Types.ObjectId(dto.propertyId), 
        name: dto.name,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        budget: dto.budget,
        enquiryType: dto.enquiryType,
        message: dto.message,
      });

      return await enquiry.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create enquiry');
    }
  }

  async getEnquiriesByAgent(agentId: string, query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter: any = {
      agentId: new Types.ObjectId(agentId),
      deletedAt: null,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        // 🔥 POPULATE buyer with small fields only
        .populate({
          path: 'buyerId',
          select: 'name email', // ✅ small data
        })
        .populate({ path: 'propertyId', select: 'property price address skuId' })
        .lean(),

      this.enquiryModel.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateEnquiryStatusByAgent(
    enquiryId: string,
    agentId: string,
    dto: UpdateEnquiryStatusDto,
  ) {
    if (!Types.ObjectId.isValid(enquiryId)) {
      throw new BadRequestException('Invalid enquiryId');
    }

    const enquiry = await this.enquiryModel.findOne({
      _id: enquiryId,
      agentId: new Types.ObjectId(agentId), // 🔐 agent ownership check
      deletedAt: null,
    });

    if (!enquiry) {
      throw new NotFoundException(
        'Enquiry not found or not assigned to this agent',
      );
    }

    enquiry.status = dto.status;

    // ✅ Auto-resolve logic
    if (
      dto.status === EnquiryStatus.RESOLVED ||
      dto.status === EnquiryStatus.CLOSED
    ) {
      enquiry.isResolved = true;
      enquiry.resolvedAt = new Date();
    } else {
      enquiry.isResolved = false;
      enquiry.resolvedAt = undefined;
    }

    if (dto.resolutionNote) {
      enquiry.resolutionNote = dto.resolutionNote;
    }

    await enquiry.save();

    return enquiry;
  }

  /**
   * 🔹 ADMIN: Get all enquiries (pagination + filters)
   */
  async adminGetAllEnquiries(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.enquiryType) {
      filter.enquiryType = query.enquiryType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phoneNumber: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .sort({ createdAt: -1 }) // 🔥 newest first
        .skip(skip)
        .limit(limit)
        .populate('buyerId', 'name email')
        .populate('agentId', 'fullName email')
        .populate('propertyId', 'property price address skuId soldOut')
        .lean(),

      this.enquiryModel.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 🔹 ADMIN: Update any enquiry
   */
  async adminUpdateEnquiry(enquiryId: string, dto: any) {
    if (!Types.ObjectId.isValid(enquiryId)) {
      throw new BadRequestException('Invalid enquiryId');
    }

    const enquiry = await this.enquiryModel.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    Object.assign(enquiry, dto);

    // auto resolve date
    if (
      dto.status === EnquiryStatus.RESOLVED ||
      dto.status === EnquiryStatus.CLOSED
    ) {
      enquiry.isResolved = true;
      enquiry.resolvedAt = new Date();
    }

    return enquiry.save();
  }

  /**
   * 🔹 ADMIN: HARD DELETE enquiry
   */
  async adminDeleteEnquiry(enquiryId: string) {
    if (!Types.ObjectId.isValid(enquiryId)) {
      throw new BadRequestException('Invalid enquiryId');
    }

    const deleted = await this.enquiryModel.findByIdAndDelete(enquiryId);

    if (!deleted) {
      throw new NotFoundException('Enquiry not found');
    }

    return { deleted: true };
  }
}
