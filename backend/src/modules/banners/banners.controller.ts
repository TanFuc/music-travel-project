import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannerPosition } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get banners by position (Public)' })
  async findByPosition(@Query('position') position?: string) {
    if (position && Object.values(BannerPosition).includes(position as BannerPosition)) {
      return this.bannersService.findByPosition(position as BannerPosition);
    }
    return this.bannersService.findByPosition(BannerPosition.HOME_MAIN_SLIDER);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners (Admin)' })
  async findAll() {
    return this.bannersService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner by ID (Admin)' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findById(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner (Admin)' })
  async create(@Body() dto: CreateBannerDto, @CurrentUser() user: any) {
    return this.bannersService.create({
      ...dto,
      createdBy: user.id,
    });
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner (Admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
    @CurrentUser() user: any,
  ) {
    return this.bannersService.update(id, {
      ...dto,
      updatedBy: user.id,
    });
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner (Admin)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.delete(id);
  }
}
