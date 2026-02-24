import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Property, PropertySchema } from './property.schema';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // ✅ THIS provides PropertyModel
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
    S3Module,
    AuthModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
