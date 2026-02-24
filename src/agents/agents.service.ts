import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  GoneException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { MailService } from '../mail/mail.service';
import { Agent, AgentDocument } from './agent.schema';
import { InitRegisterAgentDto } from './dto/init-register.dto';
import { VerifyAgentOtpDto } from './dto/verify-otp.dto';
import { SetAgentPasswordDto } from './dto/set-password.dto';
import { ResendAgentOtpDto } from './dto/resend-otp.dto';
import { encryptId, decryptId } from '../common/utils/id-crypto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
    private readonly mailService: MailService,
  ) {}

  /* =====================================================
     HELPERS
  ===================================================== */
  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /* ===================================================== */

  private ensureNotDeleted(agent: AgentDocument) {
    if (agent.deletedAt) {
      throw new BadRequestException('Account is deactivated');
    }
  }

  async initRegister(data: InitRegisterAgentDto) {
    const {
      fullName,
      email,
      phoneNumber,
      verificationMethod,
      location,
      brokerageName,
      boardName,
      province,
    } = data;

    if (verificationMethod === 'email' && !email) {
      throw new BadRequestException('Email is required');
    }

    if (verificationMethod === 'phone' && !phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const normalizedEmail = email?.toLowerCase();

    // ✅ SAFE $or (NO undefined / null bug)
    const orConditions: FilterQuery<AgentDocument>[] = [];
    if (normalizedEmail) orConditions.push({ email: normalizedEmail });
    if (phoneNumber) orConditions.push({ phoneNumber });

    if (!orConditions.length) {
      throw new BadRequestException('Email or phone number is required');
    }

    // let agent = await this.agentModel.findOne({ $or: orConditions });
    let agent = await this.agentModel.findOne({
      $or: orConditions,
    });

    if (agent) {
      this.ensureNotDeleted(agent);
    }

    if (agent && agent.isVerified && agent.password) {
      throw new BadRequestException(
        'Agent already registered. Please login or reset password.',
      );
    }

    // 🔐 DUPLICATE CHECKS
    if (normalizedEmail) {
      const emailUsed = await this.agentModel.findOne({
        email: normalizedEmail,
        _id: { $ne: agent?._id },
      });
      if (emailUsed) throw new BadRequestException('Email already in use');
    }

    if (phoneNumber) {
      const phoneUsed = await this.agentModel.findOne({
        phoneNumber,
        _id: { $ne: agent?._id },
      });
      if (phoneUsed)
        throw new BadRequestException('Phone number already in use');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const updateData: Partial<Agent> = {
      fullName,
      location,
      brokerageName,
      boardName,
      province,
      selectedVerificationMethod: verificationMethod,
      otpCode,
      otpChannel: verificationMethod,
      otpExpiresAt,
      isOtpVerified: false,
      isVerified: false,
    };

    if (normalizedEmail) updateData.email = normalizedEmail;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    if (agent) {
      Object.assign(agent, updateData);
      await agent.save();
    } else {
      agent = await this.agentModel.create(updateData);
    }

    if (!agent) {
      throw new InternalServerErrorException('Agent creation failed');
    }

    // 📧 SEND OTP EMAIL
    if (verificationMethod === 'email') {
      await this.mailService.sendOtpEmail(agent.email!, otpCode);
    }

    return {
      message: `OTP sent via ${verificationMethod}`,
      agentId: encryptId(agent._id.toString()),
      otpForTesting: otpCode, // ❌ remove in prod
      otpExpiresAt,
    };
  }

  /* =====================================================
     RESEND OTP
  ===================================================== */

  async resendOtp(data: ResendAgentOtpDto) {
    const agentId = decryptId(data.agentId);

    const agent = await this.agentModel.findById(agentId);
    if (!agent) throw new NotFoundException('Agent not found');
    this.ensureNotDeleted(agent);

    if (agent.isVerified && agent.password) {
      throw new BadRequestException('Agent already registered');
    }

    const now = new Date();

    if (agent.otpExpiresAt && agent.otpExpiresAt > now) {
      throw new BadRequestException(
        'OTP already sent and still valid. Please wait.',
      );
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    agent.otpCode = otpCode;
    agent.otpExpiresAt = otpExpiresAt;
    agent.isOtpVerified = false;

    await agent.save();

    if (agent.otpChannel === 'email') {
      await this.mailService.sendOtpEmail(agent.email!, otpCode);
    }

    return {
      message: 'New OTP sent successfully',
      agentId: data.agentId, // 🔁 encrypted again
      otpExpiresAt,
    };
  }

  /* =====================================================
     VERIFY OTP (REGISTER + FORGOT PASSWORD)
  ===================================================== */

  async verifyOtp(data: VerifyAgentOtpDto) {
    if (!data.agentId || !data.otp) {
      throw new BadRequestException('agentId and otp are required');
    }

    let agentId: string;
    try {
      agentId = decryptId(data.agentId);
    } catch {
      throw new BadRequestException('Invalid agentId');
    }

    const agent = await this.agentModel.findOne({
      _id: agentId,
      deletedAt: null,
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // 🔁 OTP already verified
    if (agent.isOtpVerified) {
      throw new ConflictException('OTP already verified');
    }

    const now = new Date();

    // ⛔ OTP expired
    if (!agent.otpExpiresAt || agent.otpExpiresAt <= now) {
      throw new GoneException('OTP expired. Please request a new OTP.');
    }

    // ⛔ OTP incorrect
    if (agent.otpCode !== data.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // ✅ OTP valid → verify
    agent.isOtpVerified = true;
    agent.otpCode = undefined;
    agent.otpExpiresAt = undefined;
    agent.otpChannel = null;

    await agent.save();

    return {
      message: 'OTP verified successfully',
      agentId: data.agentId,
      isOtpVerified: true,
    };
  }

  /* =====================================================
     SET PASSWORD (REGISTRATION)
  ===================================================== */

  async setPassword(data: SetAgentPasswordDto) {
    const agentId = decryptId(data.agentId);

    const agent = await this.agentModel.findOne({
      _id: agentId,
      deletedAt: null,
    });

    if (!agent) throw new NotFoundException('Agent not found');
    if (!agent.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    agent.password = await bcrypt.hash(data.password, 10);
    agent.isVerified = true;
    agent.verifiedBy = agent.otpChannel || null;
    agent.isOtpVerified = false;

    await agent.save();

    return {
      message: 'Registration complete. You can now log in.',
      agentId: data.agentId,
    };
  }

  /* =====================================================
     FORGOT PASSWORD FLOW
  ===================================================== */

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase();

    const agent = await this.agentModel.findOne({
      email: normalizedEmail,
      deletedAt: null,
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (!agent.password || !agent.isVerified) {
      throw new BadRequestException('Agent is not fully registered');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    agent.otpCode = otpCode;
    agent.otpExpiresAt = otpExpiresAt;
    agent.otpChannel = 'email';
    agent.isOtpVerified = false;

    await agent.save();
    await this.mailService.sendOtpEmail(agent.email!, otpCode);

    return {
      message: 'OTP sent to registered email',
      agentId: encryptId(agent._id.toString()), // ✅ ENCRYPTED
    };
  }

  async resetPassword(agentId: string, newPassword: string) {
    const decryptedId = decryptId(agentId);

    const agent = await this.agentModel.findOne({
      _id: decryptedId,
      deletedAt: null,
    });

    if (!agent) throw new NotFoundException('Agent not found');

    if (!agent.isOtpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    agent.password = await bcrypt.hash(newPassword, 10);
    agent.isOtpVerified = false;
    agent.otpCode = undefined;
    agent.otpExpiresAt = undefined;
    agent.otpChannel = null;

    await agent.save();

    return {
      message: 'Password reset successful',
    };
  }

  /* =====================================================
     COMMON
  ===================================================== */

  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.agentModel
        .find()
        .select('-password -otpCode -hashedRefreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.agentModel.countDocuments(),
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
    const agent = await this.agentModel
      .findById(id)
      .select('-password -otpCode -hashedRefreshToken')
      .lean();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }
  async updateAgent(id: string, data: any) {
    if (data.email) data.email = data.email.toLowerCase();

    const agent = await this.agentModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async deleteAgent(id: string) {
    const agent = await this.agentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    agent.deletedAt = new Date();
    await agent.save();

    return { message: 'Agent deleted successfully' };
  }

  async getMe(agentId: string) {
    const agent = await this.agentModel.findOne(
      { _id: agentId, deletedAt: null },
      {
        password: 0,
        otpCode: 0,
        otpExpiresAt: 0,
        hashedRefreshToken: 0,
      },
    );

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

 async updateMe(agentId: string, data: UpdateMyProfileDto) {
  const agent = await this.agentModel.findOne({
    _id: agentId,
    deletedAt: null,
  });

  if (!agent) {
    throw new NotFoundException('Agent not found');
  }

  // simple updates
  if (data.fullName) agent.fullName = data.fullName;
  if (data.email) agent.email = data.email.toLowerCase();
  if (data.phoneNumber) agent.phoneNumber = data.phoneNumber;
  if (data.boardName) agent.boardName = data.boardName;
  if (data.brokerageName) agent.brokerageName = data.brokerageName;
  if (data.location) agent.location = data.location;
  if (data.province) agent.province = data.province;

  await agent.save();

  // ✅ remove sensitive fields
  const result = agent.toObject();
  delete result.password;
  delete result.otpCode;
  delete result.hashedRefreshToken;

  return result;
}

}
