import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthRequest } from './interfaces/auth-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(
      body.role,
      body.email,
      body.password,
    );
    return { message: 'Login successful.', data: result };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(body.refreshToken);
    return { message: 'Tokens refreshed successfully.', data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: AuthRequest) {
    const { userId, role } = req.user;

    const result = await this.authService.logout(role, userId);

    return {
      message: 'Logged out successfully.',
      data: result,
    };
  }
}
