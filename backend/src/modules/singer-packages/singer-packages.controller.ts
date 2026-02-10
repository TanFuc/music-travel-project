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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SingerPackagesService } from './singer-packages.service';
import { CreateSingerPackageDto } from './dto/create-singer-package.dto';
import { UpdateSingerPackageDto } from './dto/update-singer-package.dto';
import { SingerPackageFilterDto } from './dto/singer-package-filter.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { FastifyRequest } from 'fastify';

// Extend FastifyRequest to include user property
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: number;
    phoneNumber: string;
    role: string;
  };
}

@ApiTags('singer-packages')
@Controller('singer-packages')
export class SingerPackagesController {
  constructor(private readonly singerPackagesService: SingerPackagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo gói đăng ký ca sĩ mới' })
  @ApiResponse({ status: 201, description: 'Gói đăng ký đã được tạo thành công' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSingerPackageDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    return this.singerPackagesService.create(createDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách gói đăng ký (Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách gói đăng ký' })
  async findAll(@Query() filterDto: SingerPackageFilterDto) {
    return this.singerPackagesService.findAll(filterDto);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách gói đăng ký đang hoạt động (Public)' })
  @ApiResponse({ status: 200, description: 'Danh sách gói đăng ký đang hoạt động' })
  async findAllActive() {
    return this.singerPackagesService.findAllActive();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Thống kê gói đăng ký' })
  async getStatistics() {
    return this.singerPackagesService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin gói đăng ký theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin gói đăng ký' })
  async findOne(@Param('id') id: string) {
    return this.singerPackagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Gói đăng ký đã được cập nhật' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSingerPackageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    return this.singerPackagesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Gói đăng ký đã được xóa' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.singerPackagesService.remove(id);
    return { message: 'Gói đăng ký đã được xóa thành công' };
  }
}
