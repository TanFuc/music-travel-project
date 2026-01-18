import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { StagesService } from './stages.service';
import { CreateStageDto, UpdateStageDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async create(@Body() createStageDto: CreateStageDto, @Request() req: any) {
    const userId = req.user?.userId;
    return this.stagesService.create(createStageDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId;
    return this.stagesService.update(+id, updateStageDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.stagesService.remove(+id, userId);
  }

  @Get(':id/seats')
  async getPhysicalSeats(
    @Param('id') id: string,
    @Query('showId') showId?: string,
  ) {
    const stageId = parseInt(id, 10);
    const show = showId ? parseInt(showId, 10) : undefined;
    return this.stagesService.getPhysicalSeats(stageId, show);
  }
}
