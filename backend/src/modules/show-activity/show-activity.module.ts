import { Module } from '@nestjs/common';
import { ShowActivityService } from './show-activity.service';
import { ShowActivityController } from './show-activity.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [ShowActivityController],
  providers: [ShowActivityService],
  exports: [ShowActivityService],
})
export class ShowActivityModule {}
