import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { CollaboratorService, CreateCollaboratorVoucherDto } from './collaborator.service';
class CreateVoucherDto {
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
}
class UpdateContentDto {
  title: string;
  content: string;
  bannerUrl?: string;
  benefits?: any;
}
@ApiTags('Collaborator')
@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly collaboratorService: CollaboratorService) {}
  @Get('content')
  @Public()
  @ApiOperation({ summary: 'Get collaborator program content (public)' })
  async getContent() {
    return this.collaboratorService.getContent();
  }
  @Get('dashboard/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commission summary for collaborator' })
  async getCommissionSummary(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.collaboratorService.getCommissionSummary(user.sub);
  }
  @Get('dashboard/commissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed commission history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['PAID', 'UNPAID'] })
  async getCommissionDetails(
    @CurrentUser()
    user: JwtPayload,
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
    @Query('startDate')
    startDate?: string,
    @Query('endDate')
    endDate?: string,
    @Query('status')
    status?: 'PAID' | 'UNPAID',
  ) {
    return this.collaboratorService.getCommissionDetails(user.sub, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
  }
  @Get('vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my vouchers as collaborator' })
  async getMyVouchers(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.collaboratorService.getMyVouchers(user.sub);
  }
  @Post('vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a voucher as collaborator' })
  async createVoucher(
    @CurrentUser()
    user: JwtPayload,
    @Body()
    dto: CreateVoucherDto,
  ) {
    const voucherDto: CreateCollaboratorVoucherDto = {
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue,
      maxDiscountAmount: dto.maxDiscountAmount,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      usageLimit: dto.usageLimit,
    };
    return this.collaboratorService.createVoucher(user.sub, voucherDto);
  }
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register to become a collaborator' })
  async becomeCollaborator(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.collaboratorService.becomeCollaborator(user.sub);
  }
}
@ApiTags('Admin - Collaborator')
@ApiBearerAuth()
@Controller('admin/collaborators')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCollaboratorController {
  constructor(private readonly collaboratorService: CollaboratorService) {}
  @Get()
  @ApiOperation({ summary: 'Get all collaborators' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllCollaborators(
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
    @Query('search')
    search?: string,
  ) {
    return this.collaboratorService.getAllCollaborators({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }
  @Put('content')
  @ApiOperation({ summary: 'Update collaborator program content' })
  async updateContent(
    @CurrentUser()
    user: JwtPayload,
    @Body()
    dto: UpdateContentDto,
  ) {
    return this.collaboratorService.updateContent({
      title: dto.title,
      content: dto.content,
      bannerUrl: dto.bannerUrl,
      benefits: dto.benefits,
      updatedBy: user.sub,
    });
  }
  @Put(':userId/status')
  @ApiOperation({ summary: 'Toggle collaborator status for a user' })
  async toggleStatus(
    @Param('userId', ParseIntPipe)
    userId: number,
    @Body('isCollaborator')
    isCollaborator: boolean,
  ) {
    return this.collaboratorService.toggleCollaboratorStatus(userId, isCollaborator);
  }
}
