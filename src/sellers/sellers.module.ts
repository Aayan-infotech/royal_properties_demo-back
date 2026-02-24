
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { Seller, SellerSchema } from './seller.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Seller.name, schema: SellerSchema },
    ]),
    MailModule
  ],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
