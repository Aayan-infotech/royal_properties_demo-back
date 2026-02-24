import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnquiriesService } from './enquiry.service';
import { EnquiryController } from './enquiry.controller';
import { Enquiry, EnquirySchema } from './enquiry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enquiry.name, schema: EnquirySchema },
    ]),
  ],
  controllers: [EnquiryController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
