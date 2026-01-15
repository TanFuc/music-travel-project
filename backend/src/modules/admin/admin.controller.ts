import { Controller, Get, Post, Patch, Delete, UseGuards, Query, Param, Body, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue statistics' })
  async getRevenue() {
    return this.adminService.getRevenueStats();
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  async getRecentBookings() {
    return this.adminService.getRecentBookings();
  }

  @Get('upcoming-shows')
  @ApiOperation({ summary: 'Get upcoming shows' })
  async getUpcomingShows() {
    return this.adminService.getUpcomingShows();
  }

  // ============================================================================
  // USERS MANAGEMENT
  // ============================================================================
  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() createUserDto: {
    phoneNumber: string;
    fullName: string;
    email?: string;
    password: string;
    role: 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER';
  }) {
    return this.adminService.createUser(createUserDto);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: {
      fullName?: string;
      email?: string;
      role?: 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER';
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  async toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserStatus(id);
  }

  // ============================================================================
  // SHOWS MANAGEMENT
  // ============================================================================
  @Get('shows')
  @ApiOperation({ summary: 'Get all shows with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getShows(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getShows(page, limit);
  }

  @Get('shows/:id')
  @ApiOperation({ summary: 'Get show by ID' })
  async getShowById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getShowById(id);
  }

  @Post('shows')
  @ApiOperation({ summary: 'Create show' })
  async createShow(@Body() data: {
    title: string;
    description?: string;
    stageId: number;
    performTime: Date;
    status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  }) {
    return this.adminService.createShow(data);
  }

  @Patch('shows/:id')
  @ApiOperation({ summary: 'Update show' })
  async updateShow(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{
      title: string;
      description: string;
      stageId: number;
      performTime: Date;
      status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
    }>,
  ) {
    return this.adminService.updateShow(id, data);
  }

  @Delete('shows/:id')
  @ApiOperation({ summary: 'Delete show' })
  async deleteShow(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteShow(id);
  }

  @Patch('shows/:id/status')
  @ApiOperation({ summary: 'Update show status' })
  async updateShowStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED' },
  ) {
    return this.adminService.updateShowStatus(id, data.status);
  }

  // ============================================================================
  // TOURS MANAGEMENT
  // ============================================================================
  @Get('tours')
  @ApiOperation({ summary: 'Get all tours with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTours(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getTours(page, limit);
  }

  @Get('tours/:id')
  @ApiOperation({ summary: 'Get tour by ID' })
  async getTourById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTourById(id);
  }

  @Post('tours')
  @ApiOperation({ summary: 'Create tour' })
  async createTour(@Body() data: {
    title: string;
    description?: string;
    duration: string;
    departureLocId?: number;
    destinationLocId?: number;
  }) {
    return this.adminService.createTour(data);
  }

  @Patch('tours/:id')
  @ApiOperation({ summary: 'Update tour' })
  async updateTour(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{
      title: string;
      description: string;
      duration: string;
      departureLocId: number;
      destinationLocId: number;
    }>,
  ) {
    return this.adminService.updateTour(id, data);
  }

  @Delete('tours/:id')
  @ApiOperation({ summary: 'Delete tour' })
  async deleteTour(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTour(id);
  }

  // ============================================================================ 
  // TICKETS CRUD
  // ============================================================================
  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async getTicketById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTicketById(id);
  }

  @Patch('tickets/:id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateTicketStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: 'AVAILABLE' | 'LOCKED' | 'SOLD' },
  ) {
    return this.adminService.updateTicketStatus(id, data.status);
  }

  // ============================================================================
  // PAYMENTS CRUD
  // ============================================================================
  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPaymentById(id);
  }

  @Patch('payments/:id/status')
  @ApiOperation({ summary: 'Update payment status' })
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' },
  ) {
    return this.adminService.updatePaymentStatus(id, data.status);
  }

  // ============================================================================
  // MEDIA CRUD
  // ============================================================================
  @Get('media/:id')
  @ApiOperation({ summary: 'Get media by ID' })
  async getMediaById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getMediaById(id);
  }

  @Post('media')
  @ApiOperation({ summary: 'Create media' })
  async createMedia(@Body() data: {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    targetType: 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST';
    targetId: number;
    isFeatured?: boolean;
  }) {
    return this.adminService.createMedia(data);
  }

  @Patch('media/:id')
  @ApiOperation({ summary: 'Update media' })
  async updateMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{
      url: string;
      isFeatured: boolean;
    }>,
  ) {
    return this.adminService.updateMedia(id, data);
  }

  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete media' })
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteMedia(id);
  }

  // ============================================================================
  // BOOKINGS MANAGEMENT
  // ============================================================================
  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] })
  async getBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('status') status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    return this.adminService.getBookings(page, limit, status);
  }

  // ============================================================================
  // TICKETS MANAGEMENT
  // ============================================================================
  @Get('tickets')
  @ApiOperation({ summary: 'Get all tickets with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'showId', required: false, type: Number })
  async getTickets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('showId', new ParseIntPipe({ optional: true })) showId?: number,
  ) {
    return this.adminService.getTickets(page, limit, showId);
  }

  // ============================================================================
  // PAYMENTS MANAGEMENT
  // ============================================================================
  @Get('payments')
  @ApiOperation({ summary: 'Get all payments/transactions with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getPayments(page, limit);
  }

  // ============================================================================
  // VOUCHERS MANAGEMENT
  // ============================================================================
  @Get('vouchers')
  @ApiOperation({ summary: 'Get all vouchers with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getVouchers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getVouchers(page, limit);
  }

  // ============================================================================
  // MEDIA MANAGEMENT
  // ============================================================================
  @Get('media')
  @ApiOperation({ summary: 'Get all media with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'targetType', required: false, enum: ['SHOW', 'TOUR', 'STAGE', 'ARTIST'] })
  async getMedia(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('targetType') targetType?: 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST',
  ) {
    return this.adminService.getMedia(page, limit, targetType);
  }

  // ============================================================================
  // NOTIFICATIONS MANAGEMENT
  // ============================================================================
  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getNotifications(page, limit);
  }

  @Post('notifications')
  @ApiOperation({ summary: 'Create notification' })
  async createNotification(@Body() data: {
    userId: number;
    title: string;
    message: string;
    type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  }) {
    return this.adminService.createNotification(data);
  }

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Broadcast notification to multiple users' })
  async broadcastNotification(@Body() data: {
    title: string;
    message: string;
    type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
    userIds?: number[];
  }) {
    return this.adminService.broadcastNotification(data);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.markNotificationAsRead(id);
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteNotification(id);
  }

  // ============================================================================
  // VOUCHERS CRUD
  // ============================================================================
  @Get('vouchers/:id')
  @ApiOperation({ summary: 'Get voucher by ID' })
  async getVoucherById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getVoucherById(id);
  }

  @Post('vouchers')
  @ApiOperation({ summary: 'Create voucher' })
  async createVoucher(@Body() data: {
    code: string;
    discountType: 'PERCENT' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }) {
    return this.adminService.createVoucher(data);
  }

  @Patch('vouchers/:id')
  @ApiOperation({ summary: 'Update voucher' })
  async updateVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{
      discountValue: number;
      minOrderValue: number;
      usageLimit: number;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
    }>,
  ) {
    return this.adminService.updateVoucher(id, data);
  }

  @Delete('vouchers/:id')
  @ApiOperation({ summary: 'Delete voucher' })
  async deleteVoucher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteVoucher(id);
  }

  // ============================================================================
  // BOOKINGS CRUD
  // ============================================================================
  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBookingById(id);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' },
  ) {
    return this.adminService.updateBookingStatus(id, data.status);
  }

  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() data?: { reason?: string },
  ) {
    return this.adminService.cancelBooking(id, data?.reason);
  }
}
