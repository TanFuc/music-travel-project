import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
