import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ShowActivityService } from './show-activity.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { ShowActivityType } from './dto/show-activity.dto';
@ApiTags('admin-show-activity')
@Controller('admin/shows/:showId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class ShowActivityController {
  constructor(private readonly showActivityService: ShowActivityService) {}
  @Get('activity-log')
  @ApiOperation({ summary: 'Get activity log for a show' })
  @ApiQuery({ name: 'activityType', required: false, enum: ShowActivityType })
  @ApiQuery({ name: 'actorId', required: false, type: Number })
  @ApiQuery({ name: 'targetType', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getShowActivityLogs(
    @Param('showId', ParseIntPipe)
    showId: number,
    @Query('activityType')
    activityType?: string,
    @Query('actorId')
    actorId?: string,
    @Query('targetType')
    targetType?: string,
    @Query('search')
    search?: string,
    @Query('startDate')
    startDate?: string,
    @Query('endDate')
    endDate?: string,
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
  ) {
    return this.showActivityService.getShowActivityLogs(showId, {
      activityType,
      actorId: actorId ? parseInt(actorId) : undefined,
      targetType,
      search,
      startDate,
      endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
  @Get('activity-summary')
  @ApiOperation({ summary: 'Get activity summary for a show' })
  async getActivitySummary(
    @Param('showId', ParseIntPipe)
    showId: number,
  ) {
    return this.showActivityService.getActivitySummary(showId);
  }
  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive analytics for a show' })
  async getShowAnalytics(
    @Param('showId', ParseIntPipe)
    showId: number,
  ) {
    return this.showActivityService.getShowAnalytics(showId);
  }
  @Get('activity-log/export')
  @ApiOperation({ summary: 'Export activity log for a show' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['csv', 'json'],
    description: 'Export format (default: json)',
  })
  @Header('Content-Type', 'application/octet-stream')
  async exportActivityLogs(
    @Param('showId', ParseIntPipe)
    showId: number,
    @Query('format')
    format: 'csv' | 'json' = 'json',
    @Res()
    res: Response,
  ) {
    const data = await this.showActivityService.exportActivityLogs(showId, format);
    if (format === 'csv') {
      res.setHeader('Content-Disposition', `attachment; filename=show-${showId}-activity-log.csv`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(data);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename=show-${showId}-activity-log.json`);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 2));
    }
  }
}
