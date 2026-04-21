import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { ConfigService } from '@nestjs/config';
describe('BookingsService Base Mock', () => {
  let service: BookingsService;
  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('test'),
  };
  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    deletePattern: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<BookingsService>(BookingsService);
  });
  it('BookingService Test Base Instance Available', () => {
    expect(service).toBeDefined();
  });
});
