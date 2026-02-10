import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService, CheckInResult } from './tickets.service';
import { LockTicketsDto } from './dto/lock-tickets.dto';
import { CheckInDto } from './dto/check-in.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Get('tiers')
  @ApiOperation({ summary: 'Get all ticket tiers (Public)' })
  @ApiResponse({ status: 200, description: 'Ticket tiers retrieved' })
  async getTierList() {
    return this.ticketsService.getTicketTiers();
  }

  @Post('lock')
  @ApiOperation({ summary: 'Lock tickets for purchase (TTL based)' })
  @ApiResponse({ status: 201, description: 'Tickets locked successfully' })
  @ApiResponse({ status: 400, description: 'Tickets not available' })
  async lockTickets(@CurrentUser() user: JwtPayload, @Body() lockTicketsDto: LockTicketsDto) {
    return this.ticketsService.lockTickets(user.sub, lockTicketsDto);
  }

  @Delete('lock/:ticketId')
  @ApiOperation({ summary: 'Release locked ticket' })
  @ApiResponse({ status: 200, description: 'Ticket released successfully' })
  async releaseTicket(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ) {
    return this.ticketsService.releaseTicket(user.sub, ticketId);
  }

  @Delete('lock')
  @ApiOperation({ summary: 'Release all locked tickets for current user' })
  @ApiResponse({ status: 200, description: 'All tickets released successfully' })
  async releaseAllTickets(@CurrentUser() user: JwtPayload) {
    return this.ticketsService.releaseAllUserTickets(user.sub);
  }

  // ==================== TICKET QUERIES ====================

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get all tickets for a booking' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  async getTicketsByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.ticketsService.getTicketsByBooking(bookingId);
  }

  @Get('booking/:bookingId/qrcodes')
  @ApiOperation({ summary: 'Get QR codes for all tickets in a booking' })
  @ApiResponse({ status: 200, description: 'QR codes generated successfully' })
  @ApiResponse({ status: 400, description: 'No tickets or not owned by user' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getTicketQRBatch(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.ticketsService.getTicketQRBatch(bookingId, user.sub);
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate ticket ownership' })
  @ApiResponse({ status: 200, description: 'Ownership validation result' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async validateOwnership(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) ticketId: number,
  ) {
    const isOwner = await this.ticketsService.validateTicketOwnership(ticketId, user.sub);
    return { isOwner };
  }

  // ==================== QR CODE & CHECK-IN ====================

  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Generate QR code for a paid ticket' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  @ApiResponse({ status: 400, description: 'Ticket not paid or not owned by user' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async generateQRCode(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) ticketId: number,
  ) {
    return this.ticketsService.generateQRCode(ticketId, user.sub);
  }

  @Post('checkin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Check-in ticket via QR code (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Check-in successful' })
  @ApiResponse({
    status: 400,
    description: 'Invalid QR, already checked in, or check-in window not open',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @Body() checkInDto: CheckInDto,
    @Ip() ipAddress: string,
  ): Promise<CheckInResult> {
    return this.ticketsService.checkIn(checkInDto, user.sub, ipAddress);
  }

  @Get('shows/:showId/checkin-stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get check-in statistics for a show (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Check-in statistics retrieved' })
  async getCheckInStats(@Param('showId', ParseIntPipe) showId: number) {
    return this.ticketsService.getCheckInStats(showId);
  }
}
