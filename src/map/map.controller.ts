import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}
  @Get('properties')
  async getMapProperties(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('zoom') zoom: number,
  ) {
    if (!lat || !lon || zoom === undefined) {
      throw new BadRequestException('lat, lon and zoom are required');
    }

    return await this.mapService.getMapData(lat, lon, zoom);
  }

  @Post('property-by-location')
  async getSinglePropertyByLocation(
    @Body('propertyId') propertyId: string,
    @Body('letLONG') letLONG: number[],
  ) {
    if (!propertyId || !letLONG || letLONG.length !== 2) {
      throw new BadRequestException('propertyId and letLONG are required');
    }

    return {
      success: true,
      message: 'Property fetched successfully',
      data: await this.mapService.getSinglePropertyByLocation(
        propertyId,
        letLONG,
      ),
    };
  }
}
