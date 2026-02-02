import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsCronService } from './payments-cron.service';
import { BookingsModule } from '../bookings/bookings.module';
import { WalletModule } from '../wallet/wallet.module';
import { TicketsModule } from '../tickets/tickets.module';
import { MoMoGateway } from './gateways/momo.gateway';
import { VNPayGateway } from './gateways/vnpay.gateway';
import { PayOSGateway } from './gateways/payos.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BookingsModule,
    WalletModule,
    TicketsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsCronService, MoMoGateway, VNPayGateway, PayOSGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
