import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { SingersService } from './singers.service';
import { CreateSingerRegistrationDto } from './dto/create-singer-registration.dto';
import { UpdateSingerRegistrationDto } from './dto/update-singer-registration.dto';
import { SingerRegistrationFilterDto } from './dto/singer-registration-filter.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { SingerRegistrationStatus } from '@prisma/client';
import { FastifyRequest } from 'fastify';

// Extend FastifyRequest to include JWT user payload (see JwtStrategy)
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    sub: number;
    phoneNumber: string;
    role: string;
  };
}

@ApiTags('singer-registrations')
@Controller('singers')
export class SingersController {
  constructor(private readonly singersService: SingersService) {}

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as a singer' })
  @ApiResponse({ status: 201, description: 'Registration submitted successfully' })
  @ApiResponse({ status: 409, description: 'Phone number or email already registered' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() createDto: CreateSingerRegistrationDto, @Req() req: AuthenticatedRequest) {
    // Registration does not require authentication; user linkage is handled in service by phone/email
    const registration = await this.singersService.create(createDto);
    return {
      message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
      data: registration
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all singer registrations (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved successfully' })
  async findAll(@Query() filterDto: SingerRegistrationFilterDto) {
    return this.singersService.findAll(filterDto);
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user singer registrations' })
  @ApiResponse({ status: 200, description: 'User registrations retrieved successfully' })
  async getMyRegistrations(@Req() req: AuthenticatedRequest) {
    // JwtAuthGuard already ensures authentication; user is attached by JwtStrategy
    const userId = req.user!.sub;
    return this.singersService.findByUserId(userId);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics() {
    return this.singersService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiOperation({ summary: 'Get singer registration by ID (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Registration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async findOne(@Param('id') id: string) {
    return this.singersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiOperation({ summary: 'Update singer registration (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Registration updated successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 409, description: 'Phone number or email already registered' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSingerRegistrationDto
  ) {
    return this.singersService.update(id, updateDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiOperation({ summary: 'Update registration status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SingerRegistrationStatus; adminNotes?: string }
  ) {
    return this.singersService.updateStatus(id, body.status, body.adminNotes);
  }

  @Post('upload-voice-sample')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload voice sample file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Voice sample file (MP3, WAV, M4A, max 10MB)'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  async uploadVoiceSample(@Req() req: FastifyRequest) {
    return this.singersService.uploadVoiceSample(req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiOperation({ summary: 'Delete singer registration (Admin only)' })
  @ApiResponse({ status: 204, description: 'Registration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async remove(@Param('id') id: string) {
    await this.singersService.remove(id);
  }
}