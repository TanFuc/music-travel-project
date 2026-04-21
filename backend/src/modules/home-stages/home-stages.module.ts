import { Module } from '@nestjs/common';
import { HomeStagesService } from './home-stages.service';
import { HomeStagesController } from './home-stages.controller';
@Module({
  controllers: [HomeStagesController],
  providers: [HomeStagesService],
})
export class HomeStagesModule {}
