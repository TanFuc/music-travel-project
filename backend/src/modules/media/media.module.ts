import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ImageProcessingController } from './image-processing.controller';
import { ImageProcessingService } from './image-processing.service';

@Module({
  controllers: [MediaController, ImageProcessingController],
  providers: [MediaService, ImageProcessingService],
  exports: [MediaService, ImageProcessingService],
})
export class MediaModule {}
