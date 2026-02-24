import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';

@Controller('buyer/watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // ✅ ADD
  @Post()
  addToWatchlist(@Req() req, @Body() dto: CreateWatchlistDto) {
    return this.watchlistService.addToWatchlist(req.user.userId, dto);
  }

  // ✅ GET MY WATCHLIST
  @Get()
  getMyWatchlist(@Req() req) {
    return this.watchlistService.getMyWatchlist(req.user.userId);
  }

  // ✅ DELETE (HARD)
  @Delete(':watchlistId')
  removeFromWatchlist(@Req() req, @Param('watchlistId') watchlistId: string) {
    return this.watchlistService.removeFromWatchlist(
      req.user.userId,
      watchlistId,
    );
  }
}
