import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name)
    private readonly faqModel: Model<FaqDocument>,
  ) {}

  // ✅ USER: ROLE BASED FAQ (TOKEN ONLY)
  async getFaqForUser(role: 'buyer' | 'seller' | 'agent') {
    return this.faqModel
      .find({
        isActive: true,
        audience: { $in: [role, 'all'] },
      })
      .sort({ order: 1, createdAt: -1 });
  }

  // ✅ CREATE FAQ (NO TOKEN)
  async createFaq(dto: CreateFaqDto) {
    return this.faqModel.create(dto);
  }

  // ✅ GET ALL FAQ (NO TOKEN)
  async getAllFaq() {
    return this.faqModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
  }

  // ✅ UPDATE FAQ (NO TOKEN)
  async updateFaq(id: string, dto: UpdateFaqDto) {
    const faq = await this.faqModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return faq;
  }

  // ✅ DELETE FAQ (NO TOKEN)
  async deleteFaq(id: string) {
    const faq = await this.faqModel.findByIdAndDelete(id);

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return { message: 'FAQ deleted successfully' };
  }
}
