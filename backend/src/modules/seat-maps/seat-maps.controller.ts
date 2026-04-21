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
  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getAllTemplates(
    @Query('isPublic')
    isPublic?: string,
  ) {
    const isPublicBoolean = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.seatMapsService.getAllTemplates(isPublicBoolean);
  }
  @Get('templates/presets')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getPresetTemplates() {
    return this.seatMapsService.getPresetTemplates();
  }
  @Get('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTemplateById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seatMapsService.getTemplateById(id);
  }
  @Post('templates')
  @Roles(UserRole.ADMIN)
  async createTemplate(
    @Body()
    dto: CreateSeatMapTemplateDto,
    @CurrentUser('sub')
    userId: number,
  ) {
    return this.seatMapsService.createTemplate(dto, userId);
  }
  @Put('templates/:id')
  @Roles(UserRole.ADMIN)
  async updateTemplate(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateSeatMapTemplateDto,
  ) {
    return this.seatMapsService.updateTemplate(id, dto);
  }
  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  async deleteTemplate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seatMapsService.deleteTemplate(id);
  }
  @Get('stages/:stageId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getStageSeatMap(
    @Param('stageId', ParseIntPipe)
    stageId: number,
  ) {
    return this.seatMapsService.getStageSeatMap(stageId);
  }
  @Post('stages/:stageId/apply-template')
  @Roles(UserRole.ADMIN)
  async applyTemplateToStage(
    @Param('stageId', ParseIntPipe)
    stageId: number,
    @Body('templateId', ParseIntPipe)
    templateId: number,
    @CurrentUser('sub')
    userId: number,
  ) {
    return this.seatMapsService.applyTemplateToStage(stageId, templateId, userId);
  }
  @Put('stages/:stageId')
  @Roles(UserRole.ADMIN)
  async updateStageSeatMap(
    @Param('stageId', ParseIntPipe)
    stageId: number,
    @Body()
    dto: UpdateStageSeatMapDto,
    @CurrentUser('sub')
    userId: number,
  ) {
    return this.seatMapsService.updateStageSeatMap(stageId, dto, userId);
  }
}
