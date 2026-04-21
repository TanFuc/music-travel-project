import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { UserRole, ComplaintStatus } from '@prisma/client';
import {
  SmartSupportService,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateComplaintDto,
  ReplyComplaintDto,
} from './smart-support.service';
@ApiTags('Smart Support')
@Controller('support')
export class SmartSupportController {
  constructor(private readonly smartSupportService: SmartSupportService) {}
  @Get('faq')
  @Public()
  @ApiOperation({ summary: 'Get all active FAQs grouped by category' })
  async getPublicFAQs() {
    return this.smartSupportService.getPublicFAQs();
  }
  @Get('faq/categories')
  @Public()
  @ApiOperation({ summary: 'Get FAQ categories' })
  async getCategories() {
    return this.smartSupportService.getCategories();
  }
  @Post('complaints')
  @Public()
  @ApiOperation({ summary: 'Submit a complaint (guest or authenticated user)' })
  async createComplaint(
    @Body()
    dto: CreateComplaintDto,
    @CurrentUser()
    user?: JwtPayload,
  ) {
    return this.smartSupportService.createComplaint(dto, user?.sub);
  }
  @Get('my-complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my submitted complaints' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyComplaints(
    @CurrentUser()
    user: JwtPayload,
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
  ) {
    return this.smartSupportService.getMyComplaints(user.sub, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }
}
@ApiTags('Admin - FAQ')
@ApiBearerAuth()
@Controller('admin/faq')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFAQController {
  constructor(private readonly smartSupportService: SmartSupportService) {}
  @Get()
  @ApiOperation({ summary: 'Get all FAQs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getAllQuestions(
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
    @Query('category')
    category?: string,
    @Query('isActive')
    isActive?: string,
  ) {
    return this.smartSupportService.getAllQuestions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      category,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }
  @Get('categories')
  @ApiOperation({ summary: 'Get all FAQ categories' })
  async getCategories() {
    return this.smartSupportService.getCategories();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  async getQuestionById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.smartSupportService.getQuestionById(id);
  }
  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  async createQuestion(
    @Body()
    dto: CreateQuestionDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.smartSupportService.createQuestion(dto, user.sub);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update an FAQ' })
  async updateQuestion(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateQuestionDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.smartSupportService.updateQuestion(id, dto, user.sub);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ' })
  async deleteQuestion(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.smartSupportService.deleteQuestion(id);
  }
}
@ApiTags('Admin - Complaints')
@ApiBearerAuth()
@Controller('admin/complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminComplaintsController {
  constructor(private readonly smartSupportService: SmartSupportService) {}
  @Get()
  @ApiOperation({ summary: 'Get all complaints with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAllComplaints(
    @Query('page')
    page?: string,
    @Query('limit')
    limit?: string,
    @Query('status')
    status?: ComplaintStatus,
    @Query('search')
    search?: string,
    @Query('startDate')
    startDate?: string,
    @Query('endDate')
    endDate?: string,
  ) {
    return this.smartSupportService.getAllComplaints({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
  @Get('stats')
  @ApiOperation({ summary: 'Get complaint statistics' })
  async getComplaintStats() {
    return this.smartSupportService.getComplaintStats();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  async getComplaintById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.smartSupportService.getComplaintById(id);
  }
  @Put(':id/reply')
  @ApiOperation({ summary: 'Reply to a complaint' })
  async replyToComplaint(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: ReplyComplaintDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.smartSupportService.replyToComplaint(id, dto, user.sub);
  }
  @Put(':id/status')
  @ApiOperation({ summary: 'Update complaint status' })
  async updateComplaintStatus(
    @Param('id', ParseIntPipe)
    id: number,
    @Body('status')
    status: ComplaintStatus,
  ) {
    return this.smartSupportService.updateComplaintStatus(id, status);
  }
}
