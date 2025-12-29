import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('wallet')
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
}
