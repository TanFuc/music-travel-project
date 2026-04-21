import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';
interface CreateUserData {
  phoneNumber: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  referredByCode?: string;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}
  private generateReferralCode(userId: number, phoneNumber: string): string {
    const prefix = phoneNumber.slice(-4).toUpperCase();
    const suffix = userId.toString(36).toUpperCase().padStart(4, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}${suffix}`;
  }
  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        email: data.email,
        role: UserRole.USER,
        referredByCode: data.referredByCode,
        wallet: {
          create: {
            balance: 0,
            currency: 'VND',
          },
        },
      },
      include: {
        wallet: true,
      },
    });
    const referralCode = this.generateReferralCode(user.id, user.phoneNumber);
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { referralCode },
      include: { wallet: true },
    });
    return updatedUser;
  }
  async findByReferralCode(referralCode: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        referralCode,
        deletedAt: null,
      },
    });
  }
  async findById(id: number): Promise<User | null> {
    const cacheKey = CacheKeys.user(id);
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) {
      return cached;
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (user) {
      await this.cache.set(cacheKey, user, CACHE_TTL.STANDARD);
    }
    return user;
  }
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        phoneNumber,
        deletedAt: null,
      },
    });
  }
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getProfile(userId: number) {
    const cacheKey = CacheKeys.userProfile(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        settings: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_001,
        message: getErrorMessage(ERROR_CODES.USER_001),
      });
    }
    await this.cache.set(cacheKey, user, CACHE_TTL.STANDARD);
    return user;
  }
  async updateProfile(userId: number, data: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_001,
        message: getErrorMessage(ERROR_CODES.USER_001),
      });
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        settings: data.settings as object | undefined,
      },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        settings: true,
        updatedAt: true,
      },
    });
    await this.invalidateUserCache(userId);
    return updatedUser;
  }
  async getWallet(userId: number) {
    const cacheKey = CacheKeys.userWallet(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    let wallet = await this.prisma.userWallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!wallet) {
      wallet = await this.prisma.userWallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'VND',
        },
        include: {
          transactions: true,
        },
      });
    }
    await this.cache.set(cacheKey, wallet, CACHE_TTL.SHORT);
    return wallet;
  }
  async getBookings(userId: number) {
    const cacheKey = CacheKeys.userBookings(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            ticket: {
              include: {
                show: {
                  select: {
                    id: true,
                    title: true,
                    performTime: true,
                  },
                },
                ticketClass: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
            tourSchedule: {
              include: {
                tour: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const result = { items: bookings };
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }
  async getShowBookings(userId: number) {
    const cacheKey = `${CacheKeys.userBookings(userId)}:shows`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        items: {
          some: {
            itemType: {
              in: ['SHOW_TICKET', 'TOUR_SLOT'],
            },
          },
        },
      },
      include: {
        items: {
          where: {
            itemType: {
              in: ['SHOW_TICKET', 'TOUR_SLOT'],
            },
          },
          include: {
            ticket: {
              include: {
                show: {
                  select: {
                    id: true,
                    title: true,
                    performTime: true,
                  },
                },
                ticketClass: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
            tourSchedule: {
              include: {
                tour: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const result = { items: bookings };
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }
  async getSingerPackageBookings(userId: number) {
    const cacheKey = `${CacheKeys.userBookings(userId)}:singer`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        items: {
          some: {
            itemType: 'SINGER_PACKAGE',
          },
        },
      },
      include: {
        items: {
          where: {
            itemType: 'SINGER_PACKAGE',
          },
          include: {
            singerPackage: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                price: true,
                description: true,
                benefits: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const result = { items: bookings };
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }
  async invalidateUserCache(userId: number) {
    await this.cache.delMany([
      CacheKeys.user(userId),
      CacheKeys.userProfile(userId),
      CacheKeys.userSession(userId),
      CacheKeys.userWallet(userId),
      CacheKeys.userBookings(userId),
      `${CacheKeys.userBookings(userId)}:shows`,
      `${CacheKeys.userBookings(userId)}:singer`,
    ]);
  }
}
