import { Controller, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { LockTicketsDto } from './dto/lock-tickets.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

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
}
