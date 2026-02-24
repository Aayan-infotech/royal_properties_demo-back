import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PropertyExtrasService } from './property-extras.service';
import { PropertyExtraDto } from './dto/property-extra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('property-extras')
export class PropertyExtrasController {
  constructor(private readonly service: PropertyExtrasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrUpdate(@Body() dto: PropertyExtraDto) {
    return this.service.upsert(dto);
  }

  @Get(':propertyId')
  async getByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getByProperty(propertyId);
  }
}
