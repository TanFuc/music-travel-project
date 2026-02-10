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
import { BankQRController } from './controllers/bank-qr.controller';
import { BankQRConfigController } from './controllers/bank-qr-config.controller';
import { BankQRService } from './services/bank-qr.service';
import { BankQRConfigService } from './services/bank-qr-config.service';
import { AdminQRService } from './services/admin-qr.service';
import { VietQRService } from './services/vietqr.service';
import { BankDeeplinkService } from './services/bank-deeplink.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BookingsModule,
    WalletModule,
    TicketsModule,
  ],
  controllers: [PaymentsController, BankQRController, BankQRConfigController],
  providers: [
    PaymentsService, 
    PaymentsCronService, 
    MoMoGateway, 
    VNPayGateway, 
    PayOSGateway,
    BankQRService,
    BankQRConfigService,
    AdminQRService,
    VietQRService,
    BankDeeplinkService,
  ],
  exports: [PaymentsService, BankQRService, BankQRConfigService, AdminQRService, VietQRService],
})
export class PaymentsModule {}
