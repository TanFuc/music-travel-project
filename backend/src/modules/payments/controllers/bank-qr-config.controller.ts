import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { BankQRConfigService } from '../services/bank-qr-config.service';
import {
  CreateBankQRConfigDto,
  UpdateBankQRConfigDto,
  BankQRConfigListResponse,
  BankQRConfigSingleResponse,
} from '../dto/bank-qr-config.dto';
import { Public } from '../../../common/decorators/public.decorator';
@ApiTags('admin/bank-qr-config')
@Controller('admin/bank-qr-config')
@Public()
export class BankQRConfigController {
  constructor(private readonly bankQRConfigService: BankQRConfigService) {}
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Create new bank QR configuration',
    description:
      'Create a new bank QR configuration. If set as active, all other configs will be deactivated.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bank QR configuration created successfully',
    type: BankQRConfigSingleResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or creation failed',
  })
  @ApiConsumes('application/json')
  async create(
    @Body()
    dto: CreateBankQRConfigDto,
  ): Promise<BankQRConfigSingleResponse> {
    const data = await this.bankQRConfigService.create(dto);
    return {
      success: true,
      data,
      message: 'Bank QR configuration created successfully',
    };
  }
  @Get()
  @ApiOperation({
    summary: 'Get all bank QR configurations',
    description: 'Retrieve all bank QR configurations, ordered by active status and creation date',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank QR configurations retrieved successfully',
    type: BankQRConfigListResponse,
  })
  async findAll(): Promise<BankQRConfigListResponse> {
    const data = await this.bankQRConfigService.findAll();
    return {
      success: true,
      data,
      message: 'Bank QR configurations retrieved successfully',
    };
  }
  @Get('active')
  @ApiOperation({
    summary: 'Get active bank QR configuration',
    description: 'Retrieve the currently active bank QR configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Active bank QR configuration retrieved successfully',
    type: BankQRConfigSingleResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No active bank QR configuration found',
  })
  async findActive(): Promise<BankQRConfigSingleResponse> {
    const data = await this.bankQRConfigService.findActive();
    if (!data) {
      return {
        success: false,
        data: null as any,
        message: 'No active bank QR configuration found',
      };
    }
    return {
      success: true,
      data,
      message: 'Active bank QR configuration retrieved successfully',
    };
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get bank QR configuration by ID',
    description: 'Retrieve a specific bank QR configuration by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Bank QR configuration ID',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Bank QR configuration retrieved successfully',
    type: BankQRConfigSingleResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Bank QR configuration not found',
  })
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<BankQRConfigSingleResponse> {
    const data = await this.bankQRConfigService.findOne(id);
    return {
      success: true,
      data,
      message: 'Bank QR configuration retrieved successfully',
    };
  }
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Update bank QR configuration',
    description:
      'Update a specific bank QR configuration. If set as active, all other configs will be deactivated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Bank QR configuration ID',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Bank QR configuration updated successfully',
    type: BankQRConfigSingleResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Bank QR configuration not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or update failed',
  })
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateBankQRConfigDto,
  ): Promise<BankQRConfigSingleResponse> {
    const data = await this.bankQRConfigService.update(id, dto);
    return {
      success: true,
      data,
      message: 'Bank QR configuration updated successfully',
    };
  }
  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate bank QR configuration',
    description: 'Activate a specific bank QR configuration and deactivate all others',
  })
  @ApiParam({
    name: 'id',
    description: 'Bank QR configuration ID',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Bank QR configuration activated successfully',
    type: BankQRConfigSingleResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Bank QR configuration not found',
  })
  async activate(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<BankQRConfigSingleResponse> {
    const data = await this.bankQRConfigService.activate(id);
    return {
      success: true,
      data,
      message: 'Bank QR configuration activated successfully',
    };
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete bank QR configuration',
    description: 'Delete a specific bank QR configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Bank QR configuration ID',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Bank QR configuration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank QR configuration not found',
  })
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.bankQRConfigService.remove(id);
  }
}
