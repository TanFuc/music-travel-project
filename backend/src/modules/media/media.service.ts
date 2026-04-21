import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaTargetType } from '@prisma/client';
import { CreateMediaDto } from './dto/create-media.dto';
import { R2StorageService } from './r2/r2-storage.service';
import { ImageProcessingService } from './image-processing.service';
@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2StorageService: R2StorageService,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}
  async findByTarget(targetType: string, targetId: number) {
    return this.prisma.media.findMany({
      where: {
        targetType: targetType as MediaTargetType,
        targetId,
      },
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
    });
  }
  async create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({
      data: {
        url: createMediaDto.url,
        type: createMediaDto.type,
        targetType: createMediaDto.targetType,
        targetId: createMediaDto.targetId,
        isFeatured: createMediaDto.isFeatured ?? false,
        displayOrder: createMediaDto.displayOrder ?? 0,
      },
    });
  }
  async uploadImage(file: any, folder: string = 'music-travel') {
    if (!file?.buffer || !file?.mimetype) {
      throw new BadRequestException('File upload không hợp lệ.');
    }
    if (!String(file.mimetype).startsWith('image/')) {
      throw new BadRequestException('Chỉ hỗ trợ tải lên tệp hình ảnh.');
    }
    try {
      const optimized = await this.imageProcessingService.optimizeForUpload(file.buffer);
      const uploaded = await this.r2StorageService.uploadBuffer({
        buffer: optimized.buffer,
        folder,
        fileExtension: optimized.extension,
        contentType: optimized.contentType,
      });
      return {
        url: uploaded.url,
        key: uploaded.key,
        format: optimized.extension,
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      throw new BadRequestException('Không thể tải ảnh lên Cloudflare R2: ' + message);
    }
  }
  async delete(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (media) {
      const key = this.r2StorageService.getKeyFromUrl(media.url);
      if (key) {
        await this.r2StorageService.deleteObject(key);
      }
    }
    await this.prisma.media.delete({ where: { id } });
    return { message: 'Đã xóa media thành công.' };
  }
}
