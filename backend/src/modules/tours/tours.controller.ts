import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourFilterDto } from './dto/tour-filter.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tours with filters' })
  @ApiResponse({ status: 200, description: 'Tours list retrieved successfully' })
  async findAll(@Query() filterDto: TourFilterDto) {
    return this.toursService.findAll(filterDto);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get tour by slug' })
  @ApiResponse({ status: 200, description: 'Tour retrieved successfully' })
  async findBySlug(@Param('slug') slug: string) {
    return this.toursService.findBySlug(slug);
  }

  @Public()
  @Get(':id/schedules')
  @ApiOperation({ summary: 'Get tour schedules' })
  @ApiResponse({ status: 200, description: 'Tour schedules retrieved successfully' })
  async getSchedules(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.getSchedules(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new tour (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Tour created successfully' })
  async create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }
}
