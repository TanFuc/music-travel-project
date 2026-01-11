import { Module } from '@nestjs/common';
import { SeatMapsController } from './seat-maps.controller';
import { SeatMapsService } from './seat-maps.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeatMapsController],
  providers: [SeatMapsService],
  exports: [SeatMapsService],
})
export class SeatMapsModule {}
