import { Controller, Get, Param, Query } from '@nestjs/common';
import { StagesService } from './stages.service';

@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  async findAll(@Query('locationId') locationId?: string) {
    const locId = locationId ? parseInt(locationId, 10) : undefined;
    return this.stagesService.findAll(locId);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.stagesService.findBySlug(slug);
  }
}
