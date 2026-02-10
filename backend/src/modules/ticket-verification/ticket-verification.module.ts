import { Module } from '@nestjs/common';
import { TicketVerificationService } from './ticket-verification.service';
import {
  TicketVerificationController,
  ShowVerificationController,
  AdminVerificationController,
} from './ticket-verification.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketVerificationController, ShowVerificationController, AdminVerificationController],
  providers: [TicketVerificationService],
  exports: [TicketVerificationService],
})
export class TicketVerificationModule {}
