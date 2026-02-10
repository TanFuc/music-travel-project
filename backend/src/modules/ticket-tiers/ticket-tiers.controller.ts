import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketTiersService } from './ticket-tiers.service';
import {
  CreateTicketTierDto,
  UpdateTicketTierDto,
  TicketTierQueryDto,
} from './dto/ticket-tier.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

// ============================================================================
// PUBLIC ENDPOINTS - Cho người dùng xem và mua vé
// ============================================================================

@ApiTags('ticket-tiers')
@Controller('ticket-tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách loại vé (public)' })
  @ApiResponse({ status: 200, description: 'Danh sách loại vé đang bán' })
  async findAllPublic() {
    return this.ticketTiersService.findAllPublic();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết loại vé (public)' })
  @ApiResponse({ status: 200, description: 'Chi tiết loại vé' })
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.ticketTiersService.findOnePublic(id);
  }

  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Kiểm tra số vé còn lại' })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Số lượng muốn mua' })
  @ApiResponse({ status: 200, description: 'Thông tin số vé còn lại' })
  async checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantity') quantity?: string,
  ) {
    const qty = quantity ? parseInt(quantity, 10) : 1;
    return this.ticketTiersService.checkAvailability(id, qty);
  }
}

// ============================================================================
// ADMIN ENDPOINTS - Quản lý loại vé
// ============================================================================

@ApiTags('admin-ticket-tiers')
@Controller('admin/ticket-tiers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class AdminTicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo loại vé mới' })
  @ApiResponse({ status: 201, description: 'Loại vé đã được tạo' })
  async create(@Body() dto: CreateTicketTierDto, @CurrentUser() user: any) {
    return this.ticketTiersService.create(dto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại vé (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Danh sách loại vé' })
  async findAll(@Query() query: TicketTierQueryDto) {
    return this.ticketTiersService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Thống kê bán vé' })
  @ApiResponse({ status: 200, description: 'Thống kê các loại vé' })
  async getStatistics() {
    return this.ticketTiersService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết loại vé (admin)' })
  @ApiResponse({ status: 200, description: 'Chi tiết loại vé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketTiersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật loại vé' })
  @ApiResponse({ status: 200, description: 'Loại vé đã được cập nhật' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketTierDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketTiersService.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa loại vé' })
  @ApiResponse({ status: 200, description: 'Loại vé đã được xóa' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketTiersService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Bật/tắt trạng thái loại vé' })
  @ApiResponse({ status: 200, description: 'Trạng thái đã được cập nhật' })
  async toggleActive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ticketTiersService.toggleActive(id, user?.sub);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Cập nhật số lượng vé' })
  @ApiResponse({ status: 200, description: 'Số lượng đã được cập nhật' })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
    @CurrentUser() user: any,
  ) {
    return this.ticketTiersService.updateStock(id, quantity, user?.sub);
  }
}
