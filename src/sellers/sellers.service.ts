import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Seller, SellerDocument } from './seller.schema';
import { InitRegisterSellerDto } from './dto/init-register.dto';
import { VerifySellerOtpDto } from './dto/verify-otp.dto';
import { SetSellerPasswordDto } from './dto/set-password.dto';
import { ResendSellerOtpDto } from './dto/resend-otp.dto';
import { MailService } from '../mail/mail.service';
import { encryptId, decryptId } from '../common/utils/id-crypto';
import { UpdateMySellerDto } from './dto/update-my-seller.dto';


@Injectable()
export class SellersService {
  constructor(
    @InjectModel(Seller.name)
    private readonly sellerModel: Model<SellerDocument>,
    private readonly mailService: MailService,
  ) {}

  /* =====================================================
     HELPERS
  ===================================================== */
  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  // ==========================================================
  private ensureNotDeleted(seller: SellerDocument) {
    if (seller.deletedAt) {
      throw new BadRequestException('Account is deactivated');
    }
  }

  /* =====================================================
     REGISTRATION FLOW
  ===================================================== */

  async initRegister(data: InitRegisterSellerDto) {
    const {
      fullName,
      location,
      email,
      phoneNumber,
      verificationMethod,
      agencyName,
    } = data;

    if (verificationMethod === 'email' && !email) {
      throw new BadRequestException('Email is required for email verification');
    }
    if (verificationMethod === 'phone' && !phoneNumber) {
      throw new BadRequestException(
        'Phone number is required for phone verification',
      );
    }

    const normalizedEmail = email?.toLowerCase();

    // ✅ SAFE OR query
    const orConditions: any[] = [];
    if (normalizedEmail) orConditions.push({ email: normalizedEmail });
    if (phoneNumber) orConditions.push({ phoneNumber });

    const existing =
      orConditions.length > 0
        ? await this.sellerModel.findOne({ $or: orConditions }).exec()
        : null;

    if (existing) {
      this.ensureNotDeleted(existing);
    }

    if (existing && existing.password) {
      throw new BadRequestException(
        'Seller already registered. Please login or reset password.',
      );
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const upsertData: Partial<Seller> = {
      fullName,
      location,
      selectedVerificationMethod: verificationMethod,
      otpCode,
      otpChannel: verificationMethod,
      otpExpiresAt,
      isOtpVerified: false,
    };

    if (normalizedEmail) upsertData.email = normalizedEmail;
    if (phoneNumber) upsertData.phoneNumber = phoneNumber;
    if (agencyName) upsertData.agencyName = agencyName;

    const seller = await this.sellerModel
      .findOneAndUpdate(
        { $or: orConditions, isVerified: false },
        { $set: upsertData },
        { upsert: true, new: true, runValidators: true },
      )
      .exec();

    // 📧 SEND OTP EMAIL
    if (verificationMethod === 'email') {
      await this.mailService.sendOtpEmail(seller!.email, otpCode);
    }

    return {
      message: `OTP sent via ${verificationMethod}`,
      sellerId: encryptId(seller!._id.toString()),
      otpForTesting: otpCode, // ❌ remove in prod
      otpExpiresAt,
    };
  }

  /* =====================================================
     RESEND OTP
  ===================================================== */

  async resendOtp(data: ResendSellerOtpDto) {
    const sellerId = decryptId(data.sellerId);

    const seller = await this.sellerModel.findOne({
      _id: sellerId,
      deletedAt: null,
    });
    if (!seller) throw new NotFoundException('Seller not found');

    if (seller.isVerified && seller.password) {
      throw new BadRequestException('Seller already registered');
    }

    const now = new Date();

    // ⛔ OTP still valid
    if (seller.otpExpiresAt && seller.otpExpiresAt > now) {
      throw new BadRequestException(
        'OTP already sent and still valid. Please wait.',
      );
    }

    // ✅ OTP expired
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    seller.otpCode = otpCode;
    seller.otpExpiresAt = otpExpiresAt;
    seller.isOtpVerified = false;

    await seller.save();

      if (seller.otpChannel === 'email') {
        await this.mailService.sendOtpEmail(seller.email, otpCode);
      }

    return {
      message: 'New OTP sent successfully',
      sellerId: data.sellerId,
      otpExpiresAt,
    };
  }

  /* =====================================================
     VERIFY OTP (USED FOR REGISTER + FORGOT PASSWORD)
  ===================================================== */

  async verifyOtp(data: VerifySellerOtpDto) {
    const now = new Date();
    const sellerId = decryptId(data.sellerId);
    const updated = await this.sellerModel
      .findOneAndUpdate(
        {
          _id: sellerId, // ✅ decrypted
          otpCode: data.otp,
          otpExpiresAt: { $gt: now },
          deletedAt: null,
        },
        {
          $set: { isOtpVerified: true },
          $unset: { otpCode: '', otpExpiresAt: '', otpChannel: '' },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
      sellerId: data.sellerId,
      isOtpVerified: updated.isOtpVerified,
    };
  }

  /* =====================================================
     SET PASSWORD (REGISTER)
  ===================================================== */

  async setPassword(data: SetSellerPasswordDto) {
    const sellerId = decryptId(data.sellerId);

    const seller = await this.sellerModel.findOne({
      _id: sellerId,
      deletedAt: null,
    });

    // const seller = await this.sellerModel.findById(data.sellerId).exec();
    if (!seller) throw new NotFoundException('Seller not found');

    if (!seller.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    seller.password = await bcrypt.hash(data.password, 10);
    seller.isVerified = true;
    seller.verifiedBy = seller.otpChannel || null;
    if (seller.otpChannel === 'email') seller.emailVerifiedAt = new Date();
    if (seller.otpChannel === 'phone') seller.phoneVerifiedAt = new Date();

    seller.isOtpVerified = false;

    await seller.save();

    return {
      message: 'Registration completed successfully',
      sellerId: data.sellerId,
    };
  }

  /* =====================================================
     FORGOT PASSWORD FLOW
  ===================================================== */

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase();

    const seller = await this.sellerModel.findOne({
      email: normalizedEmail,
      deletedAt: null,
    });
    if (!seller) throw new NotFoundException('Seller not found');

    if (!seller.password) {
      throw new BadRequestException('Seller is not fully registered');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    seller.otpCode = otpCode;
    seller.otpExpiresAt = otpExpiresAt;
    seller.otpChannel = 'email';
    seller.isOtpVerified = false;

    await seller.save();
    await this.mailService.sendOtpEmail(seller.email, otpCode);

    return {
      message: 'OTP sent to registered email',
      sellerId: encryptId(seller._id.toString()),
    };
  }

  async resetPassword(sellerIdParam: string, newPassword: string) {
    const sellerId = decryptId(sellerIdParam);

    const seller = await this.sellerModel.findOne({
      _id: sellerId,
      deletedAt: null,
    });

    if (!seller) throw new NotFoundException('Seller not found');

    if (!seller.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.isOtpVerified = false;
    seller.otpCode = undefined;
    seller.otpExpiresAt = undefined;
    seller.otpChannel = null;

    await seller.save();

    return { message: 'Password reset successful' };
  }

  /* =====================================================
     COMMON
  ===================================================== */

  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.sellerModel
        .find()
        .select('-password -otpCode -hashedRefreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.sellerModel.countDocuments(),
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
    const seller = await this.sellerModel
      .findById(id)
      .select('-password -otpCode -hashedRefreshToken')
      .lean();

    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async update(id: string, data: any) {
    if (data.email) data.email = data.email.toLowerCase();

    const seller = await this.sellerModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );

    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async delete(id: string) {
    const seller = await this.sellerModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!seller) throw new NotFoundException('Seller not found');

    seller.deletedAt = new Date();
    await seller.save();

    return { message: 'Seller deleted successfully' };
  }

  async getMe(sellerId: string) {
  const seller = await this.sellerModel.findOne(
    { _id: sellerId, deletedAt: null },
    {
      password: 0,
      otpCode: 0,
      otpExpiresAt: 0,
      hashedRefreshToken: 0,
    },
  );

  if (!seller) {
    throw new NotFoundException('Seller not found');
  }

  return seller;
}

async updateMe(sellerId: string, data: UpdateMySellerDto) {
  const seller = await this.sellerModel.findOne({
    _id: sellerId,
    deletedAt: null,
  });

  if (!seller) {
    throw new NotFoundException('Seller not found');
  }

  // If email changed → re-verify (optional but recommended)
  if (data.email && data.email !== seller.email) {
    seller.email = data.email.toLowerCase();
    seller.isVerified = false;
    seller.emailVerifiedAt = undefined;
  }

  if (data.fullName) seller.fullName = data.fullName;
  if (data.location) seller.location = data.location;
  if (data.agencyName) seller.agencyName = data.agencyName;
  if (data.city) seller.city = data.city;
  if (data.phoneNumber) seller.phoneNumber = data.phoneNumber;

  await seller.save();

  return seller;
}



}
