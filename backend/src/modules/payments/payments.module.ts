import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BookingsModule } from '../bookings/bookings.module';
import { WalletModule } from '../wallet/wallet.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [BookingsModule, WalletModule, TicketsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
