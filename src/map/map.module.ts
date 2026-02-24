import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { Property, PropertySchema } from '../property/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
