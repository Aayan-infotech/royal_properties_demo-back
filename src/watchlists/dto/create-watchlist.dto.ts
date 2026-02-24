import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateWatchlistDto {
  @IsNotEmpty()
  @IsMongoId()
  propertyId: string;
}
