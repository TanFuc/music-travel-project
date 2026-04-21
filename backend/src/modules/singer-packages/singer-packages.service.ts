import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SingerPackageTemplate } from '@prisma/client';
import { CreateSingerPackageDto } from './dto/create-singer-package.dto';
import { UpdateSingerPackageDto } from './dto/update-singer-package.dto';
import { SingerPackageFilterDto } from './dto/singer-package-filter.dto';
@Injectable()
export class SingerPackagesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createDto: CreateSingerPackageDto,
    createdBy?: number,
  ): Promise<SingerPackageTemplate> {
    const existingPackage = await this.prisma.singerPackageTemplate.findFirst({
      where: {
        name: createDto.name.trim(),
        isActive: true,
      },
    });
    if (existingPackage) {
      throw new ConflictException('Tên gói đã tồn tại');
    }
    return this.prisma.singerPackageTemplate.create({
      data: {
        ...createDto,
        name: createDto.name.trim(),
        nameEn: createDto.nameEn?.trim() || null,
        description: createDto.description?.trim() || null,
        createdBy,
      },
    });
  }
  async findAll(filterDto: SingerPackageFilterDto) {
    const { page = 1, limit = 10, isActive, search } = filterDto;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;
    const where: any = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search) {
      const sanitizedSearch = search.trim().substring(0, 100);
      where.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { nameEn: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }
    const [packages, total] = await Promise.all([
      this.prisma.singerPackageTemplate.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
      this.prisma.singerPackageTemplate.count({ where }),
    ]);
    return {
      data: packages,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
  async findAllActive() {
    return this.prisma.singerPackageTemplate.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });
  }
  async findOne(id: string): Promise<SingerPackageTemplate> {
    const packageTemplate = await this.prisma.singerPackageTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });
    if (!packageTemplate) {
      throw new NotFoundException('Không tìm thấy gói đăng ký');
    }
    return packageTemplate;
  }
  async update(
    id: string,
    updateDto: UpdateSingerPackageDto,
    updatedBy?: number,
  ): Promise<SingerPackageTemplate> {
    await this.findOne(id);
    if (updateDto.name) {
      const existingPackage = await this.prisma.singerPackageTemplate.findFirst({
        where: {
          name: updateDto.name.trim(),
          id: { not: id },
          isActive: true,
        },
      });
      if (existingPackage) {
        throw new ConflictException('Tên gói đã tồn tại');
      }
    }
    return this.prisma.singerPackageTemplate.update({
      where: { id },
      data: {
        ...updateDto,
        ...(updateDto.name && { name: updateDto.name.trim() }),
        ...(updateDto.nameEn && { nameEn: updateDto.nameEn.trim() }),
        ...(updateDto.description && { description: updateDto.description.trim() }),
        updatedBy,
      },
    });
  }
  async remove(id: string): Promise<void> {
    const packageTemplate = await this.findOne(id);
    const registrationCount = await this.prisma.singerRegistration.count({
      where: {
        packageTemplateId: id,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });
    if (registrationCount > 0) {
      throw new ConflictException('Không thể xóa gói có đăng ký đang hoạt động');
    }
    await this.prisma.singerPackageTemplate.delete({
      where: { id },
    });
  }
  async getStatistics() {
    const [totalPackages, activePackages, totalRegistrations, packageRegistrationStats] =
      await Promise.all([
        this.prisma.singerPackageTemplate.count(),
        this.prisma.singerPackageTemplate.count({ where: { isActive: true } }),
        this.prisma.singerRegistration.count({
          where: {
            packageTemplateId: { not: null },
          },
        }),
        this.prisma.singerPackageTemplate.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                registrations: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        }),
      ]);
    return {
      totalPackages,
      activePackages,
      totalRegistrations,
      packageRegistrationStats: packageRegistrationStats.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        registrationCount: pkg._count.registrations,
      })),
    };
  }
}
