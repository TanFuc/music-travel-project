import { Module } from '@nestjs/common';
import { StaticPagesService } from './static-pages.service';
import { StaticPagesController } from './static-pages.controller';
@Module({
  controllers: [StaticPagesController],
  providers: [StaticPagesService],
  exports: [StaticPagesService],
})
export class StaticPagesModule {}
