import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ImageProcessingService } from './image-processing.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
@ApiTags('media/process')
@Controller('media/process')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@ApiBearerAuth()
export class ImageProcessingController {
  constructor(private readonly imageProcessingService: ImageProcessingService) {}
  @Post('remove-background')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Remove white background from image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        threshold: { type: 'number', default: 250 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Background removed successfully' })
  async removeBackground(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('threshold')
    threshold?: string,
  ) {
    const thresholdValue = threshold ? parseInt(threshold, 10) : 250;
    const processedBuffer = await this.imageProcessingService.removeWhiteBackground(
      file.buffer,
      thresholdValue,
    );
    return {
      success: true,
      data: processedBuffer.toString('base64'),
      mimeType: 'image/png',
      size: processedBuffer.length,
    };
  }
  @Post('logo-circle')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Transform logo to circular shape with transparent background' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo transformed successfully' })
  async logoCircle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const processedBuffer = await this.imageProcessingService.transformLogoToCircle(file.buffer);
    return {
      success: true,
      data: processedBuffer.toString('base64'),
      mimeType: 'image/png',
      size: processedBuffer.length,
    };
  }
  @Post('extract-colors')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Extract dominant colors from image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Colors extracted successfully' })
  async extractColors(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const colors = await this.imageProcessingService.extractColors(file.buffer);
    return {
      success: true,
      ...colors,
    };
  }
  @Post('resize')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Resize and optimize image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        width: { type: 'number' },
        height: { type: 'number' },
        format: { type: 'string', enum: ['jpeg', 'png', 'webp'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image resized successfully' })
  async resize(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('width')
    width: string,
    @Query('height')
    height?: string,
    @Query('format')
    format?: 'jpeg' | 'png' | 'webp',
  ) {
    const widthValue = parseInt(width, 10) || 800;
    const heightValue = height ? parseInt(height, 10) : undefined;
    const formatValue = format || 'webp';
    const processedBuffer = await this.imageProcessingService.resizeImage(
      file.buffer,
      widthValue,
      heightValue,
      formatValue,
    );
    const mimeTypes = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    return {
      success: true,
      data: processedBuffer.toString('base64'),
      mimeType: mimeTypes[formatValue],
      size: processedBuffer.length,
    };
  }
  @Post('thumbnail')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate square thumbnail' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        size: { type: 'number', default: 150 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Thumbnail generated successfully' })
  async thumbnail(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('size')
    size?: string,
  ) {
    const sizeValue = size ? parseInt(size, 10) : 150;
    const processedBuffer = await this.imageProcessingService.generateThumbnail(
      file.buffer,
      sizeValue,
    );
    return {
      success: true,
      data: processedBuffer.toString('base64'),
      mimeType: 'image/webp',
      size: processedBuffer.length,
    };
  }
  @Post('metadata')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Get image metadata' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Metadata retrieved successfully' })
  async metadata(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|jpg|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const metadata = await this.imageProcessingService.getMetadata(file.buffer);
    return {
      success: true,
      ...metadata,
    };
  }
}
