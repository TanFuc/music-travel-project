import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HomeStagesService } from './home-stages.service';
import { CreateHomeStageDto } from './dto/create-home-stage.dto';
import { UpdateHomeStageDto } from './dto/update-home-stage.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
@ApiTags('home-stages')
@Controller('home-stages')
export class HomeStagesController {
  constructor(private readonly homeStagesService: HomeStagesService) {}
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all home stages (public)' })
  @ApiResponse({ status: 200, description: 'List of home stages' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(
    @Query('activeOnly')
    activeOnly?: string,
  ) {
    const isActive = activeOnly === 'true';
    return this.homeStagesService.findAll(isActive);
  }
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get home stage by ID' })
  @ApiResponse({ status: 200, description: 'Home stage details' })
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.homeStagesService.findOne(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create home stage (Admin/Staff)' })
  @ApiResponse({ status: 201, description: 'Home stage created' })
  async create(
    @Body()
    createDto: CreateHomeStageDto,
    @CurrentUser()
    user: User,
  ) {
    return this.homeStagesService.create(createDto, user.id);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update home stage (Admin/Staff)' })
  @ApiResponse({ status: 200, description: 'Home stage updated' })
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateDto: UpdateHomeStageDto,
  ) {
    return this.homeStagesService.update(id, updateDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete home stage (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home stage deleted' })
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.homeStagesService.remove(id);
  }
}
