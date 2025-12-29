import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaTargetType } from '@prisma/client';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

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

  async delete(id: number) {
    await this.prisma.media.delete({ where: { id } });
    return { message: 'Đã xóa media thành công.' };
  }
}
