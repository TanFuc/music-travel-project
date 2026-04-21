import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ImageProcessingController } from './image-processing.controller';
import { ImageProcessingService } from './image-processing.service';
import { R2StorageModule } from './r2/r2-storage.module';
@Module({
  imports: [R2StorageModule],
  controllers: [MediaController, ImageProcessingController],
  providers: [MediaService, ImageProcessingService],
  exports: [MediaService, ImageProcessingService, R2StorageModule],
})
export class MediaModule {}
