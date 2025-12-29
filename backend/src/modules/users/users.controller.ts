import { Controller, Get, Patch, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.sub, updateUserDto);
  }

  @Get('me/wallet')
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({ status: 200, description: 'User wallet retrieved successfully' })
  async getWallet(@CurrentUser() user: JwtPayload) {
    return this.usersService.getWallet(user.sub);
  }

  @Get('me/bookings')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  async getBookings(@CurrentUser() user: JwtPayload) {
    return this.usersService.getBookings(user.sub);
  }

  // Admin endpoints
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
