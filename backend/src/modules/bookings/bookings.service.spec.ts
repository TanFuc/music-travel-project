import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { TicketsService } from '@/modules/tickets/tickets.service';
import { ToursService } from '@/modules/tours/tours.service';
import { CollaboratorService } from '@/modules/collaborator/collaborator.service';
import { EnhancedLoggerService } from '@/common/services/enhanced-logger.service';
describe('BookingsService Base Mock', () => {
  let service: BookingsService;
  const mockPrismaService: any = {
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
  const mockTicketsService = {
    findById: jest.fn(),
    create: jest.fn(),
  };
  const mockToursService = {
    findById: jest.fn(),
    create: jest.fn(),
  };
  const mockCollaboratorService = {
    findById: jest.fn(),
  };
  const mockEnhancedLoggerService = {
    createChild: jest.fn().mockReturnValue({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: ToursService, useValue: mockToursService },
        { provide: CollaboratorService, useValue: mockCollaboratorService },
        { provide: EnhancedLoggerService, useValue: mockEnhancedLoggerService },
      ],
    }).compile();
    service = module.get<BookingsService>(BookingsService);
  });
  it('BookingService Test Base Instance Available', () => {
    expect(service).toBeDefined();
  });
});
