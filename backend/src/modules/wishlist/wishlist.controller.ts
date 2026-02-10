import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { ToggleWishlistDto } from './dto/toggle-wishlist.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { WishlistTargetType } from '@prisma/client';

@ApiTags('Wishlist')
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle wishlist item' })
  async toggleWishlist(@CurrentUser('sub') userId: number, @Body() dto: ToggleWishlistDto) {
    return this.wishlistService.toggleWishlist(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my wishlist' })
  async getMyWishlist(@CurrentUser('sub') userId: number) {
    return this.wishlistService.getMyWishlist(userId);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if item is wishlisted' })
  @ApiQuery({ name: 'targetType', enum: WishlistTargetType })
  @ApiQuery({ name: 'targetId', type: Number })
  async checkStatus(
    @CurrentUser('sub') userId: number,
    @Query('targetType') targetType: WishlistTargetType,
    @Query('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.wishlistService.checkStatus(userId, targetType, targetId);
  }
}
