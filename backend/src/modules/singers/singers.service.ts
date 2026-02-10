import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  SingerRegistration,
  SingerRegistrationStatus,
  SingerPackage,
  SingingExperience,
} from '@prisma/client';
import { CloudinaryService } from '@/modules/media/cloudinary/cloudinary.service';
import { FastifyRequest } from 'fastify';
import { CreateSingerRegistrationDto } from './dto/create-singer-registration.dto';
import { UpdateSingerRegistrationDto } from './dto/update-singer-registration.dto';
import { SingerRegistrationFilterDto } from './dto/singer-registration-filter.dto';

@Injectable()
export class SingersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createDto: CreateSingerRegistrationDto): Promise<SingerRegistration> {
    // Validate package selection - either legacy package or template ID must be provided
    if (!createDto.package && !createDto.packageTemplateId) {
      throw new BadRequestException('Vui lòng chọn gói đăng ký');
    }

    // If packageTemplateId is provided, validate it exists and is active
    if (createDto.packageTemplateId) {
      const packageTemplate = await this.prisma.singerPackageTemplate.findFirst({
        where: {
          id: createDto.packageTemplateId,
          isActive: true,
        },
      });

      if (!packageTemplate) {
        throw new BadRequestException('Gói đăng ký không tồn tại hoặc đã ngừng hoạt động');
      }

      // Check registration limit
      if (packageTemplate.maxRegistrations) {
        const currentRegistrations = await this.prisma.singerRegistration.count({
          where: {
            packageTemplateId: createDto.packageTemplateId,
            status: {
              in: ['PENDING', 'APPROVED'],
            },
          },
        });

        if (currentRegistrations >= packageTemplate.maxRegistrations) {
          throw new BadRequestException('Gói đăng ký đã đạt giới hạn số lượng');
        }
      }
    }

    // Sanitize input data
    const sanitizedData = {
      ...createDto,
      fullName: createDto.fullName.trim(),
      phoneNumber: createDto.phoneNumber.replace(/\D/g, ''), // Remove non-digits
      email: createDto.email.toLowerCase().trim(),
      address: createDto.address.trim(),
      favoriteGenre: createDto.favoriteGenre.trim(),
      introduction: createDto.introduction?.trim() || null,
    };

    // Try to link registration to an existing user by phone/email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ phoneNumber: sanitizedData.phoneNumber }, { email: sanitizedData.email }],
      },
      select: {
        id: true,
      },
    });

    // Prepare data to store, excluding agreeToTerms which is not persisted
    const { agreeToTerms, ...dataToStore } = sanitizedData as any;
    (dataToStore as any).userId = existingUser ? existingUser.id : null;

    // Check for duplicate phone number or email
    const existingRegistration = await this.prisma.singerRegistration.findFirst({
      where: {
        OR: [{ phoneNumber: sanitizedData.phoneNumber }, { email: sanitizedData.email }],
        status: {
          not: SingerRegistrationStatus.CANCELLED,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.phoneNumber === sanitizedData.phoneNumber) {
        throw new ConflictException('Số điện thoại này đã được đăng ký');
      }
      if (existingRegistration.email === sanitizedData.email) {
        throw new ConflictException('Email này đã được đăng ký');
      }
    }

    return this.prisma.singerRegistration.create({
      data: dataToStore,
      include: {
        packageTemplate: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: SingerRegistrationFilterDto) {
    const {
      page = 1,
      limit = 10,
      status,
      package: packageFilter,
      packageTemplateId,
      singingExperience,
      search,
    } = filterDto;

    // Limit page size for security
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (packageFilter) {
      where.package = packageFilter;
    }

    if (packageTemplateId) {
      where.packageTemplateId = packageTemplateId;
    }

    if (singingExperience) {
      where.singingExperience = singingExperience;
    }

    if (search) {
      // Sanitize search input
      const sanitizedSearch = search.trim().substring(0, 100); // Limit search length
      where.OR = [
        { fullName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { phoneNumber: { contains: sanitizedSearch } },
        { email: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const [registrations, total] = await Promise.all([
      this.prisma.singerRegistration.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          packageTemplate: true,
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.singerRegistration.count({ where }),
    ]);

    return {
      data: registrations,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string): Promise<SingerRegistration> {
    const registration = await this.prisma.singerRegistration.findUnique({
      where: { id },
      include: {
        packageTemplate: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    return registration;
  }

  async update(id: string, updateDto: UpdateSingerRegistrationDto): Promise<SingerRegistration> {
    const registration = await this.findOne(id);

    // If updating phone or email, check for duplicates
    if (updateDto.phoneNumber || updateDto.email) {
      const duplicateCheck: any = {
        id: { not: id },
        status: { not: SingerRegistrationStatus.CANCELLED },
      };

      if (updateDto.phoneNumber || updateDto.email) {
        duplicateCheck.OR = [];

        if (updateDto.phoneNumber && updateDto.phoneNumber !== registration.phoneNumber) {
          duplicateCheck.OR.push({ phoneNumber: updateDto.phoneNumber });
        }

        if (updateDto.email && updateDto.email !== registration.email) {
          duplicateCheck.OR.push({ email: updateDto.email });
        }
      }

      if (duplicateCheck.OR?.length > 0) {
        const existingRegistration = await this.prisma.singerRegistration.findFirst({
          where: duplicateCheck,
        });

        if (existingRegistration) {
          if (existingRegistration.phoneNumber === updateDto.phoneNumber) {
            throw new ConflictException('Số điện thoại này đã được đăng ký');
          }
          if (existingRegistration.email === updateDto.email) {
            throw new ConflictException('Email này đã được đăng ký');
          }
        }
      }
    }

    return this.prisma.singerRegistration.update({
      where: { id },
      data: updateDto,
      include: {
        packageTemplate: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.singerRegistration.delete({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: SingerRegistrationStatus,
    adminNotes?: string,
  ): Promise<SingerRegistration> {
    await this.findOne(id); // Check if exists

    return this.prisma.singerRegistration.update({
      where: { id },
      data: {
        status,
        ...(adminNotes && { adminNotes }),
      },
      include: {
        packageTemplate: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
  }

  async getStatistics() {
    const [
      totalRegistrations,
      pendingCount,
      approvedCount,
      rejectedCount,
      packageStats,
      experienceStats,
    ] = await Promise.all([
      this.prisma.singerRegistration.count(),
      this.prisma.singerRegistration.count({ where: { status: SingerRegistrationStatus.PENDING } }),
      this.prisma.singerRegistration.count({
        where: { status: SingerRegistrationStatus.APPROVED },
      }),
      this.prisma.singerRegistration.count({
        where: { status: SingerRegistrationStatus.REJECTED },
      }),
      this.prisma.singerRegistration.groupBy({
        by: ['package'],
        _count: { package: true },
      }),
      this.prisma.singerRegistration.groupBy({
        by: ['singingExperience'],
        _count: { singingExperience: true },
      }),
    ]);

    return {
      total: totalRegistrations,
      byStatus: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      byPackage: packageStats.reduce<Record<SingerPackage, number>>(
        (acc, stat) => {
          if (stat.package) {
            acc[stat.package] = stat._count.package;
          }
          return acc;
        },
        {} as Record<SingerPackage, number>,
      ),
      byExperience: experienceStats.reduce<Record<SingingExperience, number>>(
        (acc, stat) => {
          acc[stat.singingExperience] = stat._count.singingExperience;
          return acc;
        },
        {} as Record<SingingExperience, number>,
      ),
    };
  }

  async uploadVoiceSample(req: FastifyRequest): Promise<{ url: string }> {
    try {
      const data = await req.file();

      if (!data) {
        throw new BadRequestException('Không có file được tải lên');
      }

      // Validate file type
      const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        throw new BadRequestException('Chỉ chấp nhận file âm thanh (MP3, WAV, M4A)');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      const buffer = await data.toBuffer();
      if (buffer.length > maxSize) {
        throw new BadRequestException('File không được vượt quá 10MB');
      }

      // Upload to Cloudinary
      const result = await this.cloudinaryService.uploadFromBuffer(
        buffer,
        'singer-voice-samples',
        `voice-sample-${Date.now()}`,
      );

      if ('secure_url' in result) {
        return { url: result.secure_url };
      } else {
        throw new BadRequestException('Lỗi khi tải file lên');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi xử lý file');
    }
  }

  async findByUserId(userId: number) {
    // Get user contact info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        phoneNumber: true,
        email: true,
      },
    });

    if (!user) {
      return [];
    }

    return this.prisma.singerRegistration.findMany({
      where: {
        OR: [
          // Registrations already linked to this user
          { userId },
          // Older registrations created without userId but matching by phone/email
          {
            userId: null,
            OR: [
              { phoneNumber: user.phoneNumber },
              ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
            ],
          },
        ],
      },
      include: {
        packageTemplate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
