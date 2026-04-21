import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemConfigsService } from './system-configs.service';
import { UpsertSystemConfigDto } from './dto/upsert-system-config.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
@ApiTags('System Configs (CMS)')
@Controller('system-configs')
export class SystemConfigsController {
  constructor(private readonly systemConfigsService: SystemConfigsService) {}
  @ApiOperation({ summary: 'Get all configs mapped by key (Public Fast Fetch)' })
  @Get('public')
  async getPublicConfigs() {
    return this.systemConfigsService.getPublicConfigs();
  }
  @ApiOperation({ summary: 'Get all configs (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  async findAll() {
    return this.systemConfigsService.findAll();
  }
  @ApiOperation({ summary: 'Get config by key' })
  @Get(':key')
  async findByKey(
    @Param('key')
    key: string,
  ) {
    return this.systemConfigsService.findByKey(key);
  }
  @ApiOperation({ summary: 'Create or update a config (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  async upsert(
    @Body()
    upsertDto: UpsertSystemConfigDto,
  ) {
    return this.systemConfigsService.upsert(upsertDto);
  }
  @ApiOperation({ summary: 'Delete a config (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':key')
  async remove(
    @Param('key')
    key: string,
  ) {
    return this.systemConfigsService.remove(key);
  }
}
