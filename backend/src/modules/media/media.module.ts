import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ImageProcessingController } from './image-processing.controller';
import { ImageProcessingService } from './image-processing.service';

import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController, ImageProcessingController],
  providers: [MediaService, ImageProcessingService],
  exports: [MediaService, ImageProcessingService, CloudinaryModule],
})
export class MediaModule {}
