import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { Buyer, BuyerSchema } from '../buyers/buyer.schema';
import { Seller, SellerSchema } from '../sellers/seller.schema';
import { Agent, AgentSchema } from '../agents/agent.schema';


@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: Buyer.name, schema: BuyerSchema },
      { name: Seller.name, schema: SellerSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        return {
          secret: config.get<string>('JWT_ACCESS_SECRET') || 'super_access_secret_change_me',
          signOptions: { expiresIn: Number(config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '900') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
