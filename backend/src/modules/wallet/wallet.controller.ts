import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService, WithdrawRequestDto, ProcessWithdrawalDto } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole, WithdrawalRequestStatus } from '@prisma/client';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  async getBalance(@CurrentUser() user: JwtPayload) {
    return this.walletService.getBalance(user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getTransactions(@CurrentUser() user: JwtPayload, @Query() pagination: PaginationDto) {
    return this.walletService.getTransactions(user.sub, pagination);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit money to wallet' })
  @ApiResponse({ status: 201, description: 'Deposit initiated successfully' })
  async deposit(@CurrentUser() user: JwtPayload, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(user.sub, depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request a withdrawal from wallet' })
  @ApiResponse({ status: 201, description: 'Withdrawal request created successfully' })
  async requestWithdrawal(@CurrentUser() user: JwtPayload, @Body() dto: WithdrawRequestDto) {
    return this.walletService.requestWithdrawal(user.sub, dto);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get my withdrawal requests' })
  @ApiResponse({ status: 200, description: 'Withdrawal requests retrieved successfully' })
  async getWithdrawalRequests(@CurrentUser() user: JwtPayload, @Query() pagination: PaginationDto) {
    return this.walletService.getWithdrawalRequests(user.sub, pagination);
  }
}

// Admin Controller for Wallet/Withdrawal Management
@ApiTags('Admin - Wallet')
@ApiBearerAuth()
@Controller('admin/wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get all withdrawal requests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllWithdrawalRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: WithdrawalRequestStatus,
    @Query('search') search?: string,
  ) {
    return this.walletService.getAllWithdrawalRequests({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      search,
    });
  }

  @Get('withdrawals/stats')
  @ApiOperation({ summary: 'Get withdrawal statistics' })
  async getWithdrawalStats() {
    return this.walletService.getWithdrawalStats();
  }

  @Put('withdrawals/:id/approve')
  @ApiOperation({ summary: 'Approve a withdrawal request' })
  async approveWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto?: ProcessWithdrawalDto,
  ) {
    return this.walletService.approveWithdrawal(id, user.sub, dto);
  }

  @Put('withdrawals/:id/reject')
  @ApiOperation({ summary: 'Reject a withdrawal request and refund' })
  async rejectWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.walletService.rejectWithdrawal(id, user.sub, dto);
  }
}
