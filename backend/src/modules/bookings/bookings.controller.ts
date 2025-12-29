import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  async create(@CurrentUser() user: JwtPayload, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(user.sub, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for current user' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findByUserId(user.sub);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get booking by code' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  async findByCode(@CurrentUser() user: JwtPayload, @Param('code') code: string) {
    return this.bookingsService.findByCode(code, user.sub);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.cancel(parseInt(id), user.sub);
  }
}
