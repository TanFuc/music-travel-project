import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { TicketsModule } from '../tickets/tickets.module';
import { ToursModule } from '../tours/tours.module';
import { WalletModule } from '../wallet/wallet.module';
import { CollaboratorModule } from '../collaborator/collaborator.module';

@Module({
  imports: [TicketsModule, ToursModule, WalletModule, CollaboratorModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
