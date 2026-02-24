import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { InitRegisterDto } from './dto/init-register.dto';
import { VerifyBuyerOtpDto } from './dto/verify-buyer-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Delete, Put, Query } from '@nestjs/common';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  /* ================= REGISTRATION ================= */

  // Step 1: init register (send OTP)
  @Post('init-register')
  async initRegister(@Body() body: InitRegisterDto) {
    const result = await this.buyersService.initRegister(body);
    return {
      message: 'OTP sent.',
      data: result,
    };
  }

  // Step 1b: resend otp
  @Post('resend-otp')
  async resendOtp(@Body() body: ResendOtpDto) {
    const result = await this.buyersService.resendOtp(body);
    return {
      message: result.message,
      data: {
        buyerId: result.buyerId,
        // otpForTesting: result.otpForTesting,
        otpExpiresAt: result.otpExpiresAt,
      },
    };
  }

  // Step 2: verify otp
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyBuyerOtpDto) {
    const result = await this.buyersService.verifyOtp(body);
    return {
      message: result.message,
      data: {
        buyerId: result.buyerId,
        isOtpVerified: result.isOtpVerified,
      },
    };
  }

  // Step 3: set password
  @Post('set-password')
  async setPassword(@Body() body: SetPasswordDto) {
    const result = await this.buyersService.setPassword(body);
    return {
      message: result.message,
      data: { buyerId: result.buyerId },
    };
  }

  /* ================= FORGOT PASSWORD ================= */

  // Step 1: enter email → send OTP
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const result = await this.buyersService.forgotPassword(body.email);
    return {
      message: result.message,
      data: { buyerId: result.buyerId },
    };
  }

  // Step 3: reset password (after OTP verification)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const result = await this.buyersService.resetPassword(
      body.buyerId,
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

    const result = await this.buyersService.getAll(page, limit);

    return {
      message: 'Buyers fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const buyer = await this.buyersService.getById(id);
    return {
      message: 'Buyer fetched successfully',
      data: buyer,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBuyerDto) {
    const buyer = await this.buyersService.updateBuyer(id, body);
    return {
      message: 'Buyer updated successfully',
      data: buyer,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.buyersService.deleteBuyer(id);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMe(@Req() req: any) {
    const buyer = await this.buyersService.getMe(req.user.userId);

    return {
      message: 'Buyer profile fetched successfully',
      data: buyer,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateMe(@Req() req: any, @Body() body: UpdateMyProfileDto) {
    const buyer = await this.buyersService.updateMe(req.user.userId, body);

    return {
      message: 'Profile updated successfully',
      data: buyer,
    };
  }
}
