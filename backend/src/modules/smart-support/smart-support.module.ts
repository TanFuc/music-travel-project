import { Module } from '@nestjs/common';
import { SmartSupportService } from './smart-support.service';
import {
  SmartSupportController,
  AdminFAQController,
  AdminComplaintsController,
} from './smart-support.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [SmartSupportController, AdminFAQController, AdminComplaintsController],
  providers: [SmartSupportService],
  exports: [SmartSupportService],
})
export class SmartSupportModule {}
