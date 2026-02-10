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
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        email: data.email,
        role: UserRole.USER,
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
  }

  async findById(id: number): Promise<User | null> {
    const cacheKey = CacheKeys.user(id);

    // Try cache first
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
      // Cache user for 30 minutes
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

    // Try cache first
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

    // Cache profile for 30 minutes
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

    // Invalidate user caches
    await this.invalidateUserCache(userId);

    return updatedUser;
  }

  async getWallet(userId: number) {
    const cacheKey = CacheKeys.userWallet(userId);

    // Try cache first (short TTL for wallet due to balance changes)
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
      // Create wallet if not exists
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

    // Cache wallet for 5 minutes (balance can change frequently)
    await this.cache.set(cacheKey, wallet, CACHE_TTL.SHORT);

    return wallet;
  }

  async getBookings(userId: number) {
    const cacheKey = CacheKeys.userBookings(userId);

    // Try cache first
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

    // Cache bookings for 5 minutes
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);

    return result;
  }

  async getShowBookings(userId: number) {
    const cacheKey = `${CacheKeys.userBookings(userId)}:shows`;

    // Try cache first
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

    // Cache bookings for 5 minutes
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);

    return result;
  }

  async getSingerPackageBookings(userId: number) {
    const cacheKey = `${CacheKeys.userBookings(userId)}:singer`;

    // Try cache first
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

    // Cache bookings for 5 minutes
    await this.cache.set(cacheKey, result, CACHE_TTL.SHORT);

    return result;
  }

  /**
   * Invalidate all caches related to a user
   */
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
