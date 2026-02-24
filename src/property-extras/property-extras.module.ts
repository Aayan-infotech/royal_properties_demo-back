import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PropertyExtra,
  PropertyExtraSchema,
} from './property-extra.schema';
import { PropertyExtrasService } from './property-extras.service';
import { PropertyExtrasController } from './property-extras.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyExtra.name, schema: PropertyExtraSchema },
    ]),
  ],
  controllers: [PropertyExtrasController],
  providers: [PropertyExtrasService],
})
export class PropertyExtrasModule {}
