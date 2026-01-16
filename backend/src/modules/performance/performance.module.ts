import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController, AdminPerformanceController } from './performance.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PerformanceController, AdminPerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
