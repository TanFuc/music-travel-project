import { Controller, Post, Get, Body, Param, Query, UseGuards, Ip, Headers, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment checkout' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  async checkout(
    @CurrentUser() user: JwtPayload,
    @Body() checkoutDto: CheckoutDto,
    @Ip() ipAddress: string,
  ) {
    return this.paymentsService.checkout(user.sub, checkoutDto, ipAddress);
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status retrieved' })
  async getTransactionStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) transactionId: number,
  ) {
    return this.paymentsService.getTransactionStatus(transactionId, user.sub);
  }

  @Public()
  @Post('webhook/:gateway')
  @ApiOperation({ summary: 'Payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(
    @Param('gateway') gateway: string,
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.paymentsService.handleWebhook(gateway, payload, headers);
  }

  @Public()
  @Get('webhook/:gateway')
  @ApiOperation({ summary: 'Payment gateway return URL (for VNPay)' })
  @ApiResponse({ status: 200, description: 'Payment return processed' })
  async webhookGet(
    @Param('gateway') gateway: string,
    @Query() params: Record<string, string>,
  ) {
    return this.paymentsService.handleWebhook(gateway, params as Record<string, unknown>);
  }
}
