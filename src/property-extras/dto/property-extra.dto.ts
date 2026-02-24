import {
  IsArray,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import {
  PropertyCategory,
  NearbyPlace,
} from '../property-extra.enums';

export class PropertyExtraDto {

  @IsMongoId()
  propertyId: string;

  @IsEnum(PropertyCategory)
  propertyCategory: PropertyCategory;

  @IsArray()
  @IsEnum(NearbyPlace, { each: true })
  nearbyPlaces: NearbyPlace[];
}
