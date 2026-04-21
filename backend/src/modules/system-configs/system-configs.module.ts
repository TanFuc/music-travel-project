import { Module } from '@nestjs/common';
import { SystemConfigsService } from './system-configs.service';
import { SystemConfigsController } from './system-configs.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [SystemConfigsController],
  providers: [SystemConfigsService],
  exports: [SystemConfigsService],
})
export class SystemConfigsModule {}
