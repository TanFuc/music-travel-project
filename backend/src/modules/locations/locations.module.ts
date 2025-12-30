import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Module({
  controllers: [LocationsController, MapsController],
  providers: [LocationsService, MapsService],
  exports: [LocationsService, MapsService],
})
export class LocationsModule {}
