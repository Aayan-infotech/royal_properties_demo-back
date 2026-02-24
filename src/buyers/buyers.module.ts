import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { Buyer, BuyerSchema } from './buyer.schema';
import {MailModule} from'../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Buyer.name, schema: BuyerSchema },
    ]),
    MailModule
  ],
  controllers: [BuyersController],
  providers: [BuyersService],
  exports: [BuyersService],
})
export class BuyersModule {}
