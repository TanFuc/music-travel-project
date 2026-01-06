import { Module } from '@nestjs/common';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { SeatLayoutController } from './seat-layout.controller';
import { SeatLayoutService } from './seat-layout.service';

@Module({
  controllers: [StagesController, SeatLayoutController],
  providers: [StagesService, SeatLayoutService],
  exports: [StagesService, SeatLayoutService],
})
export class StagesModule { }
