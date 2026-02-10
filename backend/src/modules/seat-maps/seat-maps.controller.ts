import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SeatMapsService } from './seat-maps.service';
import {
  CreateSeatMapTemplateDto,
  UpdateSeatMapTemplateDto,
  UpdateStageSeatMapDto,
} from './dto/seat-map.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('seat-maps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeatMapsController {
  constructor(private readonly seatMapsService: SeatMapsService) {}

  // ============================================================================
  // SEAT MAP TEMPLATES
  // ============================================================================

  /**
   * Get all templates
   * GET /api/v1/seat-maps/templates
   */
  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getAllTemplates(@Query('isPublic') isPublic?: string) {
    const isPublicBoolean = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.seatMapsService.getAllTemplates(isPublicBoolean);
  }

  /**
   * Get preset/default templates
   * GET /api/v1/seat-maps/templates/presets
   */
  @Get('templates/presets')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getPresetTemplates() {
    return this.seatMapsService.getPresetTemplates();
  }

  /**
   * Get template by ID
   * GET /api/v1/seat-maps/templates/:id
   */
  @Get('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTemplateById(@Param('id', ParseIntPipe) id: number) {
    return this.seatMapsService.getTemplateById(id);
  }

  /**
   * Create a new template
   * POST /api/v1/seat-maps/templates
   */
  @Post('templates')
  @Roles(UserRole.ADMIN)
  async createTemplate(@Body() dto: CreateSeatMapTemplateDto, @CurrentUser('sub') userId: number) {
    return this.seatMapsService.createTemplate(dto, userId);
  }

  /**
   * Update a template
   * PUT /api/v1/seat-maps/templates/:id
   */
  @Put('templates/:id')
  @Roles(UserRole.ADMIN)
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeatMapTemplateDto,
  ) {
    return this.seatMapsService.updateTemplate(id, dto);
  }

  /**
   * Delete a template
   * DELETE /api/v1/seat-maps/templates/:id
   */
  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  async deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.seatMapsService.deleteTemplate(id);
  }

  // ============================================================================
  // STAGE SEAT MAP CONFIGURATION
  // ============================================================================

  /**
   * Get seat map for a stage
   * GET /api/v1/seat-maps/stages/:stageId
   */
  @Get('stages/:stageId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getStageSeatMap(@Param('stageId', ParseIntPipe) stageId: number) {
    return this.seatMapsService.getStageSeatMap(stageId);
  }

  /**
   * Apply a template to a stage
   * POST /api/v1/seat-maps/stages/:stageId/apply-template
   */
  @Post('stages/:stageId/apply-template')
  @Roles(UserRole.ADMIN)
  async applyTemplateToStage(
    @Param('stageId', ParseIntPipe) stageId: number,
    @Body('templateId', ParseIntPipe) templateId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.seatMapsService.applyTemplateToStage(stageId, templateId, userId);
  }

  /**
   * Update custom seat map for a stage
   * PUT /api/v1/seat-maps/stages/:stageId
   */
  @Put('stages/:stageId')
  @Roles(UserRole.ADMIN)
  async updateStageSeatMap(
    @Param('stageId', ParseIntPipe) stageId: number,
    @Body() dto: UpdateStageSeatMapDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.seatMapsService.updateStageSeatMap(stageId, dto, userId);
  }
}
