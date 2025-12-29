import { Controller, Get, Query } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannerPosition } from '@prisma/client';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findByPosition(@Query('position') position?: string) {
    if (position && Object.values(BannerPosition).includes(position as BannerPosition)) {
      return this.bannersService.findByPosition(position as BannerPosition);
    }
    return this.bannersService.findByPosition(BannerPosition.HOME_MAIN_SLIDER);
  }
}
