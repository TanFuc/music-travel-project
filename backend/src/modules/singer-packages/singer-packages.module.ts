import { Module } from '@nestjs/common';
import { SingerPackagesController } from './singer-packages.controller';
import { SingerPackagesService } from './singer-packages.service';

@Module({
  controllers: [SingerPackagesController],
  providers: [SingerPackagesService],
  exports: [SingerPackagesService],
})
export class SingerPackagesModule {}