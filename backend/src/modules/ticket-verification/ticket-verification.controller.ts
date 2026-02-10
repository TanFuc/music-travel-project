import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketVerificationService } from './ticket-verification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  VerifyTicketDto,
  VerifyTicketByQRDto,
  ManualEntryDto,
  VerificationMethod,
} from './dto/ticket-verification.dto';

// ============================================================================
// STAFF TICKET VERIFICATION ENDPOINTS
// ============================================================================
@ApiTags('ticket-verification')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class TicketVerificationController {
  constructor(private readonly ticketVerificationService: TicketVerificationService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify ticket by code' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyTicket(@Body() dto: VerifyTicketDto, @CurrentUser() user: any) {
    return this.ticketVerificationService.verifyTicket(dto, user.sub);
  }

  @Post('verify-qr')
  @ApiOperation({ summary: 'Verify ticket by QR code scan' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyTicketByQR(@Body() dto: VerifyTicketByQRDto, @CurrentUser() user: any) {
    return this.ticketVerificationService.verifyTicketByQR(
      dto.qrData,
      dto.showId,
      user.sub,
      dto.deviceInfo,
    );
  }

  @Get(':ticketCode/verification-history')
  @ApiOperation({ summary: 'Get verification history for a ticket' })
  async getTicketVerificationHistory(@Param('ticketCode') ticketCode: string) {
    return this.ticketVerificationService.getTicketVerificationHistory(ticketCode);
  }

  @Get(':ticketCode/qr-data')
  @ApiOperation({ summary: 'Generate QR data for a ticket' })
  async generateTicketQRData(@Param('ticketCode') ticketCode: string) {
    const qrData = this.ticketVerificationService.generateTicketQRData(ticketCode);
    return { qrData };
  }
}

// ============================================================================
// SHOW VERIFICATION MANAGEMENT ENDPOINTS
// ============================================================================
@ApiTags('show-verification')
@Controller('shows/:showId/verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class ShowVerificationController {
  constructor(private readonly ticketVerificationService: TicketVerificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get verifications for a show' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'successfulOnly', required: false, type: Boolean })
  async getShowVerifications(
    @Param('showId', ParseIntPipe) showId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('successfulOnly') successfulOnly?: string,
  ) {
    return this.ticketVerificationService.getVerifications({
      showId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      successfulOnly: successfulOnly === 'true',
    });
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance stats for a show' })
  async getShowAttendance(@Param('showId', ParseIntPipe) showId: number) {
    return this.ticketVerificationService.getShowAttendance(showId);
  }

  @Post('manual-entry')
  @ApiOperation({ summary: 'Manual entry override (admin only)' })
  @Roles('ADMIN')
  async manualEntry(
    @Param('showId', ParseIntPipe) showId: number,
    @Body() dto: Omit<ManualEntryDto, 'showId'>,
    @CurrentUser() user: any,
  ) {
    return this.ticketVerificationService.manualEntry({ ...dto, showId }, user.sub);
  }
}

// ============================================================================
// ADMIN VERIFICATION DASHBOARD ENDPOINTS
// ============================================================================
@ApiTags('admin-verification')
@Controller('admin/verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminVerificationController {
  constructor(private readonly ticketVerificationService: TicketVerificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all verifications with filters' })
  @ApiQuery({ name: 'showId', required: false, type: Number })
  @ApiQuery({ name: 'ticketId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'verificationMethod', required: false, enum: VerificationMethod })
  @ApiQuery({ name: 'successfulOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllVerifications(
    @Query('showId') showId?: string,
    @Query('ticketId') ticketId?: string,
    @Query('userId') userId?: string,
    @Query('verificationMethod') verificationMethod?: string,
    @Query('successfulOnly') successfulOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ticketVerificationService.getVerifications({
      showId: showId ? parseInt(showId) : undefined,
      ticketId: ticketId ? parseInt(ticketId) : undefined,
      userId: userId ? parseInt(userId) : undefined,
      verificationMethod,
      successfulOnly: successfulOnly === 'true',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
