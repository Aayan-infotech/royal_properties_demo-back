import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnquiriesService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetAgentEnquiriesDto } from './dto/get-agent-enquiries.dto';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto';
import { AdminGetEnquiriesDto } from './dto/admin-get-enquiries.dto';
import { AdminUpdateEnquiryDto } from './dto/admin-update-enquiry.dto';

@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateEnquiryDto) {
    const buyerId = req.user.userId; // ✅ from JWT

    const enquiry = await this.enquiryService.createEnquiry(buyerId, dto);

    return {
      success: true,
      message: 'Enquiry created successfully',
      data: enquiry,
    };
  }

  /**
   * 🔐 Agent: Get all enquiries assigned to me
   * agentId comes from JWT token
   */
  @Get('agent')
  @UseGuards(JwtAuthGuard, new RolesGuard('agent'))
  async getMyAgentEnquiries(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const agentId = req.user.userId; // ✅ FROM JWT

    const result = await this.enquiryService.getEnquiriesByAgent(agentId, {
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });

    return {
      status: 200,
      success: true,
      message: 'Agent enquiries fetched successfully',
      data: result, // 🔥 pagination now SAFE inside data
    };
  }

  @Patch('agent/:id/status')
  @UseGuards(JwtAuthGuard, new RolesGuard('agent'))
  async updateEnquiryStatus(
    @Param('id') enquiryId: string,
    @Req() req: any,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    const agentId = req.user.userId; // ✅ from JWT

    const updated = await this.enquiryService.updateEnquiryStatusByAgent(
      enquiryId,
      agentId,
      dto,
    );

    return {
      status: 200,
      success: true,
      message: 'Enquiry status updated successfully',
      data: updated,
    };
  }

  @Get('admin/all')
async adminGetAll(
  @Query() query: AdminGetEnquiriesDto,
) {
  const result =
    await this.enquiryService.adminGetAllEnquiries(
      query,
    );

  return {
    status: 200,
    success: true,
    message: 'All enquiries fetched successfully',
    data: result,
  };
}

@Patch('admin/:id')
async adminUpdate(
  @Param('id') enquiryId: string,
  @Body() dto: AdminUpdateEnquiryDto,
) {
  const updated =
    await this.enquiryService.adminUpdateEnquiry(
      enquiryId,
      dto,
    );

  return {
    status: 200,
    success: true,
    message: 'Enquiry updated successfully',
    data: updated,
  };
}

@Delete('admin/:id')
async adminDelete(
  @Param('id') enquiryId: string,
) {
  await this.enquiryService.adminDeleteEnquiry(
    enquiryId,
  );

  return {
    status: 200,
    success: true,
    message: 'Enquiry deleted permanently',
  };
}
}
