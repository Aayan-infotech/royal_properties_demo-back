import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { InitRegisterSellerDto } from './dto/init-register.dto';
import { VerifySellerOtpDto } from './dto/verify-otp.dto';
import { SetSellerPasswordDto } from './dto/set-password.dto';
import { ResendSellerOtpDto } from './dto/resend-otp.dto';
import { ForgotSellerPasswordDto } from './dto/forgot-password.dto';
import { ResetSellerPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Put, Delete, Query } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UpdateMySellerDto } from './dto/update-my-seller.dto';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  /* ================= REGISTRATION ================= */

  @Post('init-register')
  async initRegister(@Body() body: InitRegisterSellerDto) {
    const result = await this.sellersService.initRegister(body);
    return {
      message: 'OTP sent.',
      data: result,
    };
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: ResendSellerOtpDto) {
    const result = await this.sellersService.resendOtp(body);
    return {
      message: result.message,
      data: result,
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifySellerOtpDto) {
    const result = await this.sellersService.verifyOtp(body);
    return {
      message: result.message,
      data: {
        sellerId: result.sellerId,
        isOtpVerified: result.isOtpVerified,
      },
    };
  }

  @Post('set-password')
  async setPassword(@Body() body: SetSellerPasswordDto) {
    const result = await this.sellersService.setPassword(body);
    return {
      message: result.message,
      data: { sellerId: result.sellerId },
    };
  }

  /* ================= FORGOT PASSWORD ================= */

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotSellerPasswordDto) {
    const result = await this.sellersService.forgotPassword(body.email);
    return {
      message: result.message,
      data: { sellerId: result.sellerId },
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetSellerPasswordDto) {
    const result = await this.sellersService.resetPassword(
      body.sellerId,
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

    const result = await this.sellersService.getAll(page, limit);
    return {
      message: 'Fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.sellersService.getById(id);
    return {
      message: 'Fetched successfully',
      data,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSellerDto) {
    const data = await this.sellersService.update(id, body);
    return {
      message: 'Updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sellersService.delete(id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('me/profile')
  // getMyProfile(@Req() req: any) {
  //   return {
  //     message: 'Profile fetched successfully.',
  //     data: req.user,
  //   };
  // }


   @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMe(@Req() req: any) {
    const seller = await this.sellersService.getMe(req.user.userId);
    return {
      message: 'Seller profile fetched successfully',
      data: seller,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateMe(
    @Req() req: any,
    @Body() body: UpdateMySellerDto,
  ) {
    const seller = await this.sellersService.updateMe(
      req.user.userId,
      body,
    );

    return {
      message: 'Seller profile updated successfully',
      data: seller,
    };
  }
}
