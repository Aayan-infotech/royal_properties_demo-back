import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /* ========= CREATE ========= */
  @Post()
  @UseGuards(JwtAuthGuard) // 🔐 JWT REQUIRED
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  create(
    @Req() req: AuthRequest, // ✅ GET USER FROM TOKEN
    @Body() dto: CreatePropertyDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    // 🔑 sellerId from JWT
    const sellerId = req.user.userId;

    return this.propertyService.create(
      dto,
      sellerId,
      files?.images,
      files?.video?.[0],
    );
  }

  /* ========= UPDATE ========= */
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    return this.propertyService.update(
      id,
      dto,
      files?.images,
      files?.video?.[0],
    );
  }

  /* ========= AGENT → MY PROPERTIES ========= */
  @Get('AgentProperties')
  @UseGuards(JwtAuthGuard, new RolesGuard('agent'))
  async getMyProperties(
    @Req() req: AuthRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const agentId = req.user.userId; // ✅ TYPE SAFE

    return this.propertyService.findByAgentId(agentId, {
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  /* ========= SELLER → MY PROPERTIES ========= */
  @Get('my-properties')
  @UseGuards(JwtAuthGuard, new RolesGuard('seller'))
  async getMySellerProperties(
    @Req() req: AuthRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const sellerId = req.user.userId; // ✅ FROM JWT TOKEN

    return {
      status: 200,
      success: true,
      message: 'Seller properties fetched successfully',
      data: await this.propertyService.findBySellerId(sellerId, {
        page: Number(page),
        limit: Number(limit),
        search,
      }),
    };
  }

  /* ========= getApprovedProperties ========= */
  @Get('approved')
  async getApprovedProperties(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,

    // ✅ ADD THESE TWO LINES
    @Query('propertyCategory') propertyCategory?: string,
    @Query('nearbyPlaces') nearbyPlaces?: string,
  ) {
    return {
      status: 200,
      success: true,
      message: 'Approved properties fetched successfully',
      data: await this.propertyService.getApprovedProperties({
        page: Number(page),
        limit: Number(limit),
        search,

        // ✅ NOW THESE EXIST
        propertyCategory,
        nearbyPlaces,
      }),
    };
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.propertyService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyService.findOne(id);

    return {
      status: 200,
      success: true,
      message: 'Property fetched successfully',
      data,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }

  /* ========= Delete sing video img by id  ========= */
  @Delete(':propertyId/media/:mediaId')
  deleteSingleMedia(
    @Param('propertyId') propertyId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.propertyService.deleteMedia(propertyId, mediaId);
  }
}
