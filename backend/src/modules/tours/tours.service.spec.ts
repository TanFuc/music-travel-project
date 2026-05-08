import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
describe('ToursService', () => {
  let service: ToursService;
  let prisma: PrismaService;
  let cache: CacheService;
  const mockPrismaService: any = {
    tour: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };
  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    deletePattern: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToursService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();
    service = module.get<ToursService>(ToursService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create Combo vs Tour', () => {
    it('creates a normal tour properly (isCombo=false)', async () => {
      const createDto = { title: 'Dalat Tour', isCombo: false };
      mockPrismaService.tour.create.mockResolvedValue({ id: 1, ...createDto });
      const result = await service.create(createDto as any);
      expect(prisma.tour.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isCombo: false, title: 'Dalat Tour' }),
        }),
      );
      expect(result.id).toBe(1);
    });
    it('creates a combo tour properly linked to a show (isCombo=true, linkedShowId=5)', async () => {
      const createDto = { title: 'Dalat Show Combo', isCombo: true, linkedShowId: 5 };
      mockPrismaService.tour.create.mockResolvedValue({ id: 2, ...createDto });
      const result = await service.create(createDto as any);
      expect(prisma.tour.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isCombo: true,
            linkedShowId: 5,
            title: 'Dalat Show Combo',
          }),
        }),
      );
      expect(result.linkedShowId).toBe(5);
    });
  });
  describe('findAll', () => {
    it('returns split data based on isCombo flag', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.tour.findMany.mockResolvedValue([{ id: 3, title: 'A', isCombo: true }]);
      mockPrismaService.tour.count.mockResolvedValue(1);
      const result = (await service.findAll({ page: 1, limit: 10, isCombo: true })) as any;
      expect(prisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isCombo: true }),
        }),
      );
      expect(result.meta.total).toBe(1);
      expect(result.items[0].isCombo).toBe(true);
    });
    it('handles isCombo as string "false" (common in query params)', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.tour.findMany.mockResolvedValue([{ id: 4, title: 'B', isCombo: false }]);
      mockPrismaService.tour.count.mockResolvedValue(1);
      const result = (await service.findAll({ page: 1, limit: 10, isCombo: false })) as any;
      expect(prisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isCombo: false }),
        }),
      );
      expect(result.items[0].isCombo).toBe(false);
    });
    it('returns all tours when isCombo is undefined', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.tour.findMany.mockResolvedValue([
        { id: 5, title: 'C', isCombo: true },
        { id: 6, title: 'D', isCombo: false },
      ]);
      mockPrismaService.tour.count.mockResolvedValue(2);
      const result = (await service.findAll({ page: 1, limit: 10 })) as any;
      expect(prisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ isCombo: expect.anything() }),
        }),
      );
      expect(result.items.length).toBe(2);
    });
  });
});
