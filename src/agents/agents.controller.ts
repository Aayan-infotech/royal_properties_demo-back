import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { InitRegisterAgentDto } from './dto/init-register.dto';
import { VerifyAgentOtpDto } from './dto/verify-otp.dto';
import { SetAgentPasswordDto } from './dto/set-password.dto';
import { ResendAgentOtpDto } from './dto/resend-otp.dto';
import { ForgotAgentPasswordDto } from './dto/forgot-password.dto';
import { ResetAgentPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Delete, Put, Query } from '@nestjs/common';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  /* ================= REGISTRATION ================= */

  // Step 1: Init register → send OTP
  @Post('init-register')
  async initRegister(@Body() body: InitRegisterAgentDto) {
    const result = await this.agentsService.initRegister(body);
    return {
      message: result.message,
      data: {
        agentId: result.agentId,
        otpExpiresAt: result.otpExpiresAt,
        otpForTesting: result.otpForTesting, // ❌ remove in prod
      },
    };
  }

  // Step 1b: Resend OTP
  @Post('resend-otp')
  async resendOtp(@Body() body: ResendAgentOtpDto) {
    const result = await this.agentsService.resendOtp(body);
    return {
      message: result.message,
      data: {
        agentId: result.agentId,
        otpExpiresAt: result.otpExpiresAt,
        // otpForTesting: result.otpForTesting, // ❌ remove in prod
      },
    };
  }

  // Step 2: Verify OTP (used for register + forgot password)
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyAgentOtpDto) {
    const result = await this.agentsService.verifyOtp(body);
    return {
      message: result.message,
      data: {
        agentId: result.agentId,
        isOtpVerified: result.isOtpVerified,
      },
    };
  }

  // Step 3: Set password (registration)
  @Post('set-password')
  async setPassword(@Body() body: SetAgentPasswordDto) {
    const result = await this.agentsService.setPassword(body);
    return {
      message: result.message,
      data: {
        agentId: result.agentId,
      },
    };
  }

  /* ================= FORGOT PASSWORD ================= */

  // Step 1: Enter email → send OTP
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotAgentPasswordDto) {
    const result = await this.agentsService.forgotPassword(body.email);
    return {
      message: result.message,
      data: {
        agentId: result.agentId,
      },
    };
  }

  // Step 3: Reset password (after OTP verify)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetAgentPasswordDto) {
    const result = await this.agentsService.resetPassword(
      body.agentId,
      body.newPassword,
    );
    return {
      message: result.message,
    };
  }

  /* ================= COMMON ================= */

  @Get()
  async getAll(@Query() query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const result = await this.agentsService.getAll(page, limit);

    return {
      message: 'Agents fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const agent = await this.agentsService.getById(id);
    return {
      message: 'Agent fetched successfully',
      data: agent,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateAgentDto) {
    const agent = await this.agentsService.updateAgent(id, body);
    return {
      message: 'Agent updated successfully',
      data: agent,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.agentsService.deleteAgent(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Req() req: any) {
    if (req.user.role !== 'agent') {
      throw new ForbiddenException('Access denied');
    }

    const agent = await this.agentsService.getMe(req.user.userId);

    return {
      message: 'Profile fetched successfully',
      data: agent,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateMyProfile(
    @Req() req: any,
    @Body() body: UpdateMyProfileDto,
  ) {
    const agent = await this.agentsService.updateMe(
      req.user.userId,
      body,
    );

    return {
      message: 'Profile updated successfully',
      data: agent,
    };
  }
}
