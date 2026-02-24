import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Buyer, BuyerDocument } from './buyer.schema';
import { InitRegisterDto } from './dto/init-register.dto';
import { VerifyBuyerOtpDto } from './dto/verify-buyer-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { MailService } from '../mail/mail.service';
import { encryptId, decryptId } from '../common/utils/id-crypto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Injectable()
export class BuyersService {
  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // =================================================================

  private ensureNotDeleted(buyer: BuyerDocument) {
    if (buyer.deletedAt) {
      throw new BadRequestException('Account is deactivated');
    }
  }

  // ===============================================================
  constructor(
    @InjectModel(Buyer.name)
    private readonly buyerModel: Model<BuyerDocument>,
    private readonly mailService: MailService,
  ) {}

  /* =====================================================
     REGISTRATION FLOW
  ===================================================== */

  async initRegister(data: InitRegisterDto) {
    const { name, email, phoneNumber, verificationMethod } = data;

    // 1️⃣ Validate input
    if (verificationMethod === 'email' && !email) {
      throw new BadRequestException('Email is required');
    }
    if (verificationMethod === 'phone' && !phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    // 2️⃣ Build safe query (avoid undefined OR bug)
    const query: any[] = [];

    if (email) {
      query.push({ email: email.toLowerCase() });
    }
    if (phoneNumber) {
      query.push({ phoneNumber });
    }

    // 3️⃣ Check existing user (only if query exists)
    const existing =
      query.length > 0
        ? await this.buyerModel.findOne({ $or: query }).exec()
        : null;

    if (existing) {
      this.ensureNotDeleted(existing);
    }

    // 4️⃣ Block only fully registered users
    if (existing && existing.password) {
      throw new BadRequestException(
        'User already registered. Please login or reset password.',
      );
    }

    // 5️⃣ Generate OTP
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 6️⃣ Upsert buyer safely
    const buyer = await this.buyerModel
      .findOneAndUpdate(
        { $or: query },
        {
          $set: {
            name,
            ...(email && { email: email.toLowerCase() }),
            ...(phoneNumber && { phoneNumber }),
            selectedVerificationMethod: verificationMethod,
            otpCode,
            otpChannel: verificationMethod,
            otpExpiresAt,
            isOtpVerified: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    // 7️⃣ Send OTP
    if (verificationMethod === 'email') {
      await this.mailService.sendOtpEmail(buyer.email, otpCode);
    }

    return {
      message: `OTP sent via ${verificationMethod}`,
      buyerId: encryptId(buyer._id.toString()),
      // otpForTesting: otpCode, // ❌ remove in production
      otpExpiresAt,
    };
  }

  async resendOtp(data: ResendOtpDto) {
    const buyerId = decryptId(data.buyerId);

    const buyer = await this.buyerModel.findOne({
      _id: buyerId,
      deletedAt: null,
    });
    if (!buyer) throw new NotFoundException('Buyer not found');
    this.ensureNotDeleted(buyer);
    if (buyer.isVerified && buyer.password) {
      throw new BadRequestException('Buyer already registered');
    }

    const now = new Date();

    // ⛔ OTP still valid
    if (buyer.otpExpiresAt && buyer.otpExpiresAt > now) {
      throw new BadRequestException(
        'OTP already sent and still valid. Please wait.',
      );
    }

    // ✅ OTP expired → generate new
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    buyer.otpCode = otpCode;
    buyer.otpExpiresAt = otpExpiresAt;
    buyer.isOtpVerified = false;

    await buyer.save();

    if (buyer.otpChannel === 'email') {
      await this.mailService.sendOtpEmail(buyer.email, otpCode);
    }

    return {
      message: 'New OTP sent successfully',
      buyerId: data.buyerId,
      otpExpiresAt,
    };
  }

  async verifyOtp(data: VerifyBuyerOtpDto) {
    const buyerId = decryptId(data.buyerId);
    const now = new Date();

    const buyer = await this.buyerModel.findOneAndUpdate(
      {
        _id: buyerId,
        otpCode: data.otp,
        otpExpiresAt: { $gt: now },
        deletedAt: null,
      },
      {
        $set: { isOtpVerified: true },
        $unset: { otpCode: '', otpExpiresAt: '', otpChannel: '' },
      },
      { new: true },
    );

    if (!buyer) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
      buyerId: data.buyerId,
      isOtpVerified: true,
    };
  }

  async setPassword(data: SetPasswordDto) {
    const buyerId = decryptId(data.buyerId);

    const buyer = await this.buyerModel.findOne({
      _id: buyerId,
      deletedAt: null,
    });

    if (!buyer) throw new NotFoundException('Buyer not found');
    if (!buyer.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    buyer.password = await bcrypt.hash(data.password, 10);
    buyer.isVerified = true;
    buyer.isOtpVerified = false;

    await buyer.save();

    return {
      message: 'Registration completed successfully',
      buyerId: data.buyerId,
    };
  }

  /* =====================================================
     FORGOT PASSWORD FLOW (EMAIL OTP)
  ===================================================== */

  async forgotPassword(email: string) {
    const buyer = await this.buyerModel.findOne({
      email: email.toLowerCase(),
      deletedAt: null,
    });

    if (!buyer) {
      throw new NotFoundException('User not found');
    }

    if (!buyer.password || !buyer.isVerified) {
      throw new BadRequestException('User is not fully registered');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    buyer.otpCode = otpCode;
    buyer.otpExpiresAt = otpExpiresAt;
    buyer.otpChannel = 'email';
    buyer.isOtpVerified = false;

    await buyer.save();
    await this.mailService.sendOtpEmail(buyer.email, otpCode);

    return {
      message: 'OTP sent to email',
      buyerId: encryptId(buyer._id.toString()), // ✅ FIX
    };
  }

  async resetPassword(buyerId: string, newPassword: string) {
    const decryptedId = decryptId(buyerId);

    const buyer = await this.buyerModel.findOne({
      _id: decryptedId,
      deletedAt: null,
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    if (!buyer.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    buyer.password = await bcrypt.hash(newPassword, 10);
    buyer.isOtpVerified = false;
    buyer.otpCode = undefined;
    buyer.otpExpiresAt = undefined;
    buyer.otpChannel = null;

    await buyer.save();

    return { message: 'Password reset successful' };
  }

  /* =====================================================
     COMMON
  ===================================================== */

  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.buyerModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.buyerModel.countDocuments(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const buyer = await this.buyerModel.findById(id).lean();
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }
    return buyer;
  }

  async updateBuyer(id: string, updateData: any) {
    const buyer = await this.buyerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    return buyer;
  }

  async deleteBuyer(id: string) {
    const buyer = await this.buyerModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    buyer.deletedAt = new Date();
    await buyer.save();

    return { message: 'Buyer deleted successfully' };
  }

  async getMe(buyerId: string) {
    const buyer = await this.buyerModel.findOne(
      { _id: buyerId, deletedAt: null },
      {
        password: 0,
        otpCode: 0,
        otpExpiresAt: 0,
        hashedRefreshToken: 0,
      },
    );

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    return buyer;
  }

  async updateMe(buyerId: string, data: UpdateMyProfileDto) {
    const buyer = await this.buyerModel.findOne({
      _id: buyerId,
      deletedAt: null,
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    // Optional: email re-verification logic
    if (data.email && data.email !== buyer.email) {
      buyer.email = data.email.toLowerCase();
      buyer.isVerified = false;
      buyer.emailVerifiedAt = undefined;
    }

    if (data.name) buyer.name = data.name;
    if (data.phoneNumber) buyer.phoneNumber = data.phoneNumber;

    await buyer.save();

    return buyer;
  }
}
