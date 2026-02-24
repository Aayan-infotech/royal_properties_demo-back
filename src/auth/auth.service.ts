import {
  UnauthorizedException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Buyer, BuyerDocument } from '../buyers/buyer.schema';
import { Seller, SellerDocument } from '../sellers/seller.schema';
import { Agent, AgentDocument } from '../agents/agent.schema';

type Role = 'buyer' | 'seller' | 'agent';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Buyer.name) private readonly buyerModel: Model<BuyerDocument>,
    @InjectModel(Seller.name)
    private readonly sellerModel: Model<SellerDocument>,
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // return a neutral model to avoid TS overload issues
  private modelForRole(role: Role): Model<any> {
    if (role === 'seller') return this.sellerModel as Model<any>;
    if (role === 'agent') return this.agentModel as Model<any>;
    return this.buyerModel as Model<any>;
  }

  private async findUserByEmail(role: Role, email: string): Promise<any> {
    const model = this.modelForRole(role);
    const lookup = email?.toLowerCase?.() ?? email;
    // debug
    // console.warn(`[Auth] findUserByEmail role=${role} lookup=${lookup}`);
    return model.findOne({ email: lookup }).exec();
  }

  // debug-friendly validateUser (remove console.warns in production)
  async validateUser(
    role: Role,
    email: string,
    password: string,
  ): Promise<any> {
    const lookupEmail = email?.toLowerCase?.() ?? email;
    // debug
    console.warn(
      `[Auth] validateUser() called role=${role} email=${lookupEmail}`,
    );

    const user = await this.findUserByEmail(role, lookupEmail);
    if (!user) {
      console.warn(
        `[Auth] login failed — user not found for role=${role} email=${lookupEmail}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // debug: show which model returned and _id
    console.warn(`[Auth] user found id=${user._id} role=${role}`);

    if (!user.password) {
      console.warn(
        `[Auth] login failed — no password set for user ${user._id} (${lookupEmail})`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      console.warn(
        `[Auth] login failed — account not verified for user ${user._id}`,
      );
      throw new UnauthorizedException('Account not verified');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.warn(
      `[Auth] password compare result for user ${user._id}: ${isMatch}`,
    );

    if (!isMatch) {
      console.warn(`[Auth] login failed — wrong password for user ${user._id}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async getTokens(user: any, role: Role) {
    const payload = { sub: user._id.toString(), email: user.email, role };

    const accessSecret =
      this.config.get<string>('JWT_ACCESS_SECRET') ||
      'super_access_secret_change_me';
    const refreshSecret =
      this.config.get<string>('JWT_REFRESH_SECRET') || 'dev_refresh_secret';

    const accessExpiresIn = Number(
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '86400',
    );
    const refreshExpiresIn = Number(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '2592000',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    role: Role,
    userId: string,
    refreshToken: string,
  ) {
    const model = this.modelForRole(role);
    const saltRounds = 10;
    const hashedRefresh = await bcrypt.hash(refreshToken, saltRounds);
    await model.findByIdAndUpdate(userId, {
      hashedRefreshToken: hashedRefresh,
    });
  }

  async login(role: Role, email: string, password: string) {
    const user = await this.validateUser(role, email, password);
    const tokens = await this.getTokens(user, role);
    await this.updateRefreshToken(
      role,
      user._id.toString(),
      tokens.refreshToken,
    );

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.fullName,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload: any = this.jwtService.decode(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { sub: userId, role, exp } = payload;

    if (!userId || !role) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    // ⏱ Manual expiry check (VERY IMPORTANT)
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp < now) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const model = this.modelForRole(role);
    const user = await model.findById(userId).exec();

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.getTokens(user, role);
    await this.updateRefreshToken(role, userId, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(role: Role, userId: string) {
    const model = this.modelForRole(role);
    await model.findByIdAndUpdate(userId, {
      $unset: { hashedRefreshToken: 1 },
    });
    return { message: 'Logged out successfully' };
  }
}
