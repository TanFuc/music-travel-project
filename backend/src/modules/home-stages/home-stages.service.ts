import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHomeStageDto } from './dto/create-home-stage.dto';
import { UpdateHomeStageDto } from './dto/update-home-stage.dto';
@Injectable()
export class HomeStagesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(activeOnly = false) {
    return this.prisma.homeStage.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }
  async findOne(id: number) {
    const stage = await this.prisma.homeStage.findUnique({
      where: { id },
    });
    if (!stage) {
      throw new NotFoundException('Không tìm thấy sân khấu.');
    }
    return stage;
  }
  async create(createDto: CreateHomeStageDto, userId?: number) {
    return this.prisma.homeStage.create({
      data: {
        ...createDto,
        createdBy: userId,
      },
    });
  }
  async update(id: number, updateDto: UpdateHomeStageDto) {
    await this.findOne(id);
    return this.prisma.homeStage.update({
      where: { id },
      data: updateDto,
    });
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.homeStage.delete({
      where: { id },
    });
    return { message: 'Đã xóa thành công.' };
  }
}
