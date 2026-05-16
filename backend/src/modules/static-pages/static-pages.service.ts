import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
@Injectable()
export class StaticPagesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    return this.prisma.staticPage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findActive() {
    return this.prisma.staticPage.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { title: 'asc' },
    });
  }
  async findBySlug(slug: string) {
    const page = await this.prisma.staticPage.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
    if (!page) {
      throw new NotFoundException(`Trang với slug "${slug}" không tồn tại.`);
    }
    return page;
  }
  async findById(id: number) {
    const page = await this.prisma.staticPage.findUnique({
      where: { id },
    });
    if (!page || page.deletedAt) {
      throw new NotFoundException('Không tìm thấy trang tĩnh.');
    }
    return page;
  }
  async create(dto: CreateStaticPageDto, userId: number) {
    const existing = await this.prisma.staticPage.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException('Slug này đã tồn tại.');
    }
    return this.prisma.staticPage.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }
  async update(id: number, dto: UpdateStaticPageDto, userId: number) {
    await this.findById(id);
    if (dto.slug) {
      const existing = await this.prisma.staticPage.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('Slug này đã tồn tại.');
      }
    }
    return this.prisma.staticPage.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }
  async remove(id: number, userId: number) {
    await this.findById(id);
    return this.prisma.staticPage.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
