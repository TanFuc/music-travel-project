import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaTargetType } from '@prisma/client';
import { CreateMediaDto } from './dto/create-media.dto';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
    try {
      const result = await this.cloudinaryService.uploadFile(file, folder);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      throw new BadRequestException('Không thể tải ảnh lên Cloudinary: ' + error.message);
    }
  }

  async delete(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (media) {
      // If it's a cloudinary URL, we might want to delete from cloudinary too
      // But we need the publicId which isn't stored in the DB right now.
      // For now just delete from DB.
    }
    await this.prisma.media.delete({ where: { id } });
    return { message: 'Đã xóa media thành công.' };
  }
}
