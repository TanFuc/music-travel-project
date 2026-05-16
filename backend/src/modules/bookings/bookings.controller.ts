import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Health check for bookings API' })
  @ApiResponse({ status: 200, description: 'OK' })
  ping() {
    return { ok: true, service: 'bookings' };
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiBody({
    description:
      'Booking payload. Either an object with tourItems/ticketsWithSeats, or a raw array of tour items: [{ scheduleId, quantity }, ...]',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            tourItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scheduleId: { type: 'number' },
                  quantity: { type: 'number' },
                  ticketTypeName: { type: 'string' },
                },
              },
            },
            ticketsWithSeats: { type: 'array', items: { type: 'object' } },
            voucherCode: { type: 'string' },
            note: { type: 'string' },
          },
        },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: { scheduleId: { type: 'number' }, quantity: { type: 'number' } },
          },
        },
      ],
    },
  })
  async create(
    @CurrentUser()
    user: JwtPayload,
    @Body()
    createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.sub, createBookingDto);
  }
  @Post(':code/confirm-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm manual payment transferred' })
  @ApiResponse({ status: 200, description: 'Booking payment confirmed' })
  async confirmPayment(
    @CurrentUser()
    user: JwtPayload,
    @Param('code')
    code: string,
  ) {
    return this.bookingsService.confirmManualPayment(code, user.sub);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings for current user' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.bookingsService.findByUserId(user.sub);
  }
  @Get(':code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by code' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  async findByCode(
    @CurrentUser()
    user: JwtPayload,
    @Param('code')
    code: string,
  ) {
    return this.bookingsService.findByCode(code, user.sub);
  }
  @Get(':code/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed booking information' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  async getDetails(
    @CurrentUser()
    user: JwtPayload,
    @Param('code')
    code: string,
  ) {
    return this.bookingsService.getBookingDetails(code, user.sub);
  }
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancel(
    @CurrentUser()
    user: JwtPayload,
    @Param('id')
    id: string,
  ) {
    return this.bookingsService.cancel(parseInt(id, 10), user.sub);
  }
}
