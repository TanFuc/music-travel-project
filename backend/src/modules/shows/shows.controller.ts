import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowFilterDto } from './dto/show-filter.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('shows')
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all shows with filters' })
  @ApiResponse({ status: 200, description: 'Shows list retrieved successfully' })
  async findAll(@Query() filterDto: ShowFilterDto) {
    return this.showsService.findAll(filterDto);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get show by slug' })
  @ApiResponse({ status: 200, description: 'Show retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Show not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.showsService.findBySlug(slug);
  }

  @Public()
  @Get(':id/seats')
  @ApiOperation({ summary: 'Get show seat map' })
  @ApiResponse({ status: 200, description: 'Seat map retrieved successfully' })
  async getSeatMap(@Param('id', ParseIntPipe) id: number) {
    return this.showsService.getSeatMap(id);
  }

  @Public()
  @Get(':id/ticket-classes')
  @ApiOperation({ summary: 'Get show ticket classes' })
  @ApiResponse({ status: 200, description: 'Ticket classes retrieved successfully' })
  async getTicketClasses(@Param('id', ParseIntPipe) id: number) {
    return this.showsService.getTicketClasses(id);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new show (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Show created successfully' })
  async create(@Body() createShowDto: CreateShowDto) {
    return this.showsService.create(createShowDto);
  }
}
