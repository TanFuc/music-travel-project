import { Module } from '@nestjs/common';
import { SingersController } from './singers.controller';
import { SingersService } from './singers.service';
import { CloudinaryModule } from '@/modules/media/cloudinary/cloudinary.module';
@Module({
  imports: [CloudinaryModule],
  controllers: [SingersController],
  providers: [SingersService],
  exports: [SingersService],
})
export class SingersModule {}
