import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FaqService } from './faq.service';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateFaqDto } from './dto/create-faq.dto';


@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ✅ ROLE-BASED FAQ (TOKEN REQUIRED)
  @UseGuards(JwtAuthGuard)
  @Get()
  getFaq(@Req() req) {
    return this.faqService.getFaqForUser(req.user.role);
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  // ✅ GET ALL FAQ (NO TOKEN)
  @Get('all')
  getAllFaq() {
    return this.faqService.getAllFaq();
  }

  // ✅ UPDATE FAQ (NO TOKEN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqService.updateFaq(id, dto);
  }

  // ✅ DELETE FAQ (NO TOKEN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.deleteFaq(id);
  }
}
