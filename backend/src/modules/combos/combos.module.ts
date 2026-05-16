import { Module } from '@nestjs/common';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { CacheModule } from '@/cache/cache.module';
@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}
