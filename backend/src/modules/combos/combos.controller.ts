import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CombosService } from './combos.service';
import { CreateTourDto } from '../tours/dto/create-tour.dto';
import { UpdateTourDto } from '../tours/dto/update-tour.dto';
import { CreateScheduleDto } from '../tours/dto/create-schedule.dto';
import { TourFilterDto } from '../tours/dto/tour-filter.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
@ApiTags('combos')
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all combos with filters' })
  @ApiResponse({ status: 200, description: 'Combos list retrieved successfully' })
  async findAll(
    @Query()
    filterDto: TourFilterDto,
  ) {
    return this.combosService.findAll(filterDto);
  }
  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get combo by slug' })
  @ApiResponse({ status: 200, description: 'Combo retrieved successfully' })
  async findBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.combosService.findBySlug(slug);
  }
  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related combos' })
  @ApiResponse({ status: 200, description: 'Related combos retrieved successfully' })
  async getRelated(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.combosService.getRelated(id);
  }
  @Public()
  @Get(':id/schedules')
  @ApiOperation({ summary: 'Get combo schedules' })
  @ApiResponse({ status: 200, description: 'Combo schedules retrieved successfully' })
  async getSchedules(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.combosService.getSchedules(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new combo (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Combo created successfully' })
  async create(
    @Body()
    createTourDto: CreateTourDto,
  ) {
    return this.combosService.create(createTourDto);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update combo (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Combo updated successfully' })
  @ApiResponse({ status: 404, description: 'Combo not found' })
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateTourDto: UpdateTourDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.combosService.update(id, updateTourDto, user.sub);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete combo (Admin only)' })
  @ApiResponse({ status: 200, description: 'Combo deleted successfully' })
  @ApiResponse({ status: 404, description: 'Combo not found' })
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.combosService.softDelete(id, user.sub);
  }
  @Post(':id/schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add schedule to combo (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  @ApiResponse({ status: 404, description: 'Combo not found' })
  async createSchedule(
    @Param('id', ParseIntPipe)
    comboId: number,
    @Body()
    createScheduleDto: CreateScheduleDto,
  ) {
    return this.combosService.createSchedule(comboId, createScheduleDto);
  }
}
