import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import {
  CreatePerformanceQRCodeDto,
  CreatePerformanceRegistrationDto,
  ReviewRegistrationDto,
  ScanQRCodeDto,
  UpdateQRCodeDto,
  AssignSlotDto,
} from './dto/performance.dto';

// ============================================================================
// PUBLIC ENDPOINTS (for users scanning QR codes)
// ============================================================================
@ApiTags('performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('qr-codes/scan')
  @Public()
  @ApiOperation({ summary: 'Scan QR code and get registration info' })
  @ApiResponse({ status: 200, description: 'QR code info retrieved' })
  async scanQRCode(@Body() dto: ScanQRCodeDto) {
    return this.performanceService.scanQRCode(dto.code);
  }

  @Post('registrations')
  @Public()
  @ApiOperation({ summary: 'Create performance registration' })
  @ApiResponse({ status: 201, description: 'Registration created' })
  async createRegistration(
    @Body() dto: CreatePerformanceRegistrationDto,
    @CurrentUser() user?: any,
  ) {
    return this.performanceService.createRegistration(dto, user?.id);
  }

  @Get('registrations/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user registrations' })
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.performanceService.getUserRegistrations(user.id);
  }

  @Post('registrations/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel own registration' })
  async cancelMyRegistration(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.cancelRegistration(id, user.id);
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================
@ApiTags('admin-performance')
@Controller('admin/performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class AdminPerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ============================================================================
  // QR CODE MANAGEMENT
  // ============================================================================
  @Post('shows/:showId/qr-codes')
  @ApiOperation({ summary: 'Create QR code for show' })
  async createQRCode(
    @Param('showId', ParseIntPipe) showId: number,
    @Body() dto: CreatePerformanceQRCodeDto,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.createQRCode(showId, dto, user.id);
  }

  @Get('shows/:showId/qr-codes')
  @ApiOperation({ summary: 'Get QR codes for show' })
  async getShowQRCodes(@Param('showId', ParseIntPipe) showId: number) {
    return this.performanceService.getShowQRCodes(showId);
  }

  @Patch('qr-codes/:id')
  @ApiOperation({ summary: 'Update QR code' })
  async updateQRCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQRCodeDto,
  ) {
    return this.performanceService.updateQRCode(id, dto);
  }

  @Delete('qr-codes/:id')
  @ApiOperation({ summary: 'Delete QR code' })
  async deleteQRCode(@Param('id', ParseIntPipe) id: number) {
    return this.performanceService.deleteQRCode(id);
  }

  // ============================================================================
  // REGISTRATION MANAGEMENT
  // ============================================================================
  @Get('registrations')
  @ApiOperation({ summary: 'Get all registrations' })
  @ApiQuery({ name: 'showId', required: true, type: Number })
  @ApiQuery({ name: 'stageId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getRegistrations(
    @Query('showId', ParseIntPipe) showId: number,
    @Query('stageId') stageId?: string,
    @Query('status') status?: string,
  ) {
    return this.performanceService.getRegistrations({
      showId,
      stageId: stageId ? parseInt(stageId) : undefined,
      status,
    });
  }

  @Get('registrations/:id')
  @ApiOperation({ summary: 'Get registration by ID' })
  async getRegistrationById(@Param('id', ParseIntPipe) id: number) {
    return this.performanceService.getRegistrationById(id);
  }

  @Patch('registrations/:id/review')
  @ApiOperation({ summary: 'Review registration (approve/reject)' })
  async reviewRegistration(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRegistrationDto,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.reviewRegistration(id, dto, user.id);
  }

  @Post('registrations/:id/cancel')
  @ApiOperation({ summary: 'Admin cancel registration' })
  async cancelRegistration(@Param('id', ParseIntPipe) id: number) {
    return this.performanceService.cancelRegistration(id);
  }

  // ============================================================================
  // PERFORMANCE SLOTS
  // ============================================================================
  @Post('registrations/:id/slot')
  @ApiOperation({ summary: 'Assign performance slot to registration' })
  async assignSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignSlotDto,
  ) {
    return this.performanceService.assignSlot(id, dto);
  }

  @Get('shows/:showId/schedule')
  @ApiOperation({ summary: 'Get performance schedule for show' })
  @ApiQuery({ name: 'stageId', required: false, type: Number })
  async getPerformanceSchedule(
    @Param('showId', ParseIntPipe) showId: number,
    @Query('stageId') stageId?: string,
  ) {
    return this.performanceService.getPerformanceSchedule(
      showId,
      stageId ? parseInt(stageId) : undefined,
    );
  }
}
