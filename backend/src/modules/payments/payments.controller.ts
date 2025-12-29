import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
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
  async checkout(@CurrentUser() user: JwtPayload, @Body() checkoutDto: CheckoutDto) {
    return this.paymentsService.checkout(user.sub, checkoutDto);
  }

  @Public()
  @Post('webhook/:gateway')
  @ApiOperation({ summary: 'Payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(@Param('gateway') gateway: string, @Body() payload: Record<string, unknown>) {
    return this.paymentsService.handleWebhook(gateway, payload);
  }
}
