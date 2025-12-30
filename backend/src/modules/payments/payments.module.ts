import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BookingsModule } from '../bookings/bookings.module';
import { WalletModule } from '../wallet/wallet.module';
import { TicketsModule } from '../tickets/tickets.module';
import { MoMoGateway } from './gateways/momo.gateway';
import { VNPayGateway } from './gateways/vnpay.gateway';

@Module({
  imports: [BookingsModule, WalletModule, TicketsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MoMoGateway, VNPayGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
