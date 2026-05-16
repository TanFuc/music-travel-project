import { Test, TestingModule } from '@nestjs/testing';
import { CombosService } from './combos.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
describe('CombosService', () => {
  let service: CombosService;
  const mockPrismaService: any = {
    tour: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    tourSchedule: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delMany: jest.fn(),
    delPattern: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();
    service = module.get<CombosService>(CombosService);
    jest.clearAllMocks();
  });
  it('updates combo with all supported fields including minPrice and linkedShowId', async () => {
    mockPrismaService.tour.findFirst.mockResolvedValue({
      id: 46,
      slug: 'combo-cu',
      isCombo: true,
      deletedAt: null,
    });
    mockPrismaService.tour.update.mockResolvedValue({
      id: 46,
      title: 'Combo Moi',
      minPrice: 3490000,
      linkedShowId: 99,
    });
    await service.update(
      46,
      {
        title: 'Combo Moi',
        description: 'Mo ta moi',
        duration: '3 ngay 2 dem',
        departureLocId: 1,
        destinationLocId: 2,
        branchId: 3,
        properties: { thumbnailUrl: 'https://example.com/a.jpg' },
        minPrice: 3490000,
        linkedShowId: 99,
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
        metaKeywords: 'combo,dalat',
      },
      7,
    );
    expect(mockPrismaService.tour.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 46 },
        data: expect.objectContaining({
          updatedBy: 7,
          title: 'Combo Moi',
          description: 'Mo ta moi',
          duration: '3 ngay 2 dem',
          departureLocId: 1,
          destinationLocId: 2,
          branchId: 3,
          properties: { thumbnailUrl: 'https://example.com/a.jpg' },
          minPrice: 3490000,
          linkedShowId: 99,
          metaTitle: 'Meta title',
          metaDescription: 'Meta description',
          metaKeywords: 'combo,dalat',
        }),
      }),
    );
    expect(mockCacheService.delMany).toHaveBeenCalled();
    expect(mockCacheService.delPattern).toHaveBeenCalledWith('combo_list_*');
  });
  it('supports unlinking combo from show via linkedShowId = null', async () => {
    mockPrismaService.tour.findFirst.mockResolvedValue({
      id: 46,
      slug: 'combo-cu',
      isCombo: true,
      deletedAt: null,
    });
    mockPrismaService.tour.update.mockResolvedValue({
      id: 46,
      linkedShowId: null,
    });
    await service.update(
      46,
      {
        linkedShowId: null,
      },
      7,
    );
    expect(mockPrismaService.tour.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          updatedBy: 7,
          linkedShowId: null,
        }),
      }),
    );
  });
});
