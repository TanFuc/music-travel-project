import { Module } from '@nestjs/common';
import { TicketTiersService } from './ticket-tiers.service';
import { TicketTiersController, AdminTicketTiersController } from './ticket-tiers.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [TicketTiersController, AdminTicketTiersController],
  providers: [TicketTiersService],
  exports: [TicketTiersService],
})
export class TicketTiersModule {}
