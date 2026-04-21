import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { MediaModule } from '@/modules/media/media.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { R2StorageService } from '@/modules/media/r2/r2-storage.service';
import { ImageProcessingService } from '@/modules/media/image-processing.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CacheModule } from '@/cache/cache.module';

describe('Media + Admin API (e2e)', () => {
  let app: NestFastifyApplication;

  let mediaIdSequence = 1;
  const mediaStore = new Map<number, any>();

  const prismaMock = {
    media: {
      findMany: jest.fn(async () => Array.from(mediaStore.values())),
      findUnique: jest.fn(async ({ where: { id } }: { where: { id: number } }) => {
        return mediaStore.get(id) ?? null;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        const created = {
          id: mediaIdSequence++,
          displayOrder: 0,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        mediaStore.set(created.id, created);
        return created;
      }),
      update: jest.fn(async ({ where: { id }, data }: { where: { id: number }; data: any }) => {
        const current = mediaStore.get(id);
        if (!current) {
          throw new Error('Media not found');
        }
        const updated = {
          ...current,
          ...data,
          updatedAt: new Date(),
        };
        mediaStore.set(id, updated);
        return updated;
      }),
      delete: jest.fn(async ({ where: { id } }: { where: { id: number } }) => {
        const current = mediaStore.get(id);
        if (!current) {
          throw new Error('Media not found');
        }
        mediaStore.delete(id);
        return current;
      }),
    },
  };

  const cacheMock = {
    delPattern: jest.fn().mockResolvedValue(0),
  };

  const r2StorageMock = {
    uploadBuffer: jest.fn(),
    deleteObject: jest.fn(),
    getKeyFromUrl: jest.fn((url: string) => {
      const marker = '/uploads/';
      const idx = url.indexOf(marker);
      if (idx === -1) {
        return null;
      }
      return url.slice(idx + marker.length);
    }),
  };

  const imageProcessingMock = {
    optimizeForUpload: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MediaModule, AdminModule, CacheModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(CacheService)
      .useValue(cacheMock)
      .overrideProvider(R2StorageService)
      .useValue(r2StorageMock)
      .overrideProvider(ImageProcessingService)
      .useValue(imageProcessingMock)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(import('@fastify/multipart'));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    mediaStore.clear();
    mediaIdSequence = 1;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('uploads multipart image to /media/upload', async () => {
    imageProcessingMock.optimizeForUpload.mockResolvedValue({
      buffer: Buffer.from('optimized-image'),
      width: 960,
      height: 540,
      size: 15360,
      extension: 'webp',
      contentType: 'image/webp',
    });

    r2StorageMock.uploadBuffer.mockResolvedValue({
      key: 'admin-media/new-image.webp',
      url: 'https://cdn.example.com/uploads/admin-media/new-image.webp',
    });

    const response = await request(app.getHttpServer())
      .post('/media/upload')
      .field('folder', 'admin-media')
      .attach('file', Buffer.from('raw-image-data'), 'banner.png')
      .expect(201);

    expect(response.body.url).toBe('https://cdn.example.com/uploads/admin-media/new-image.webp');
    expect(response.body.key).toBe('admin-media/new-image.webp');
    expect(response.body.format).toBe('webp');
    expect(response.body.width).toBe(960);
    expect(response.body.height).toBe(540);

    expect(imageProcessingMock.optimizeForUpload).toHaveBeenCalledTimes(1);
    expect(r2StorageMock.uploadBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'admin-media',
        contentType: 'image/webp',
        fileExtension: 'webp',
      }),
    );
  });

  it('creates media then updates URL and deletes old R2 file', async () => {
    const oldUrl = 'https://cdn.example.com/uploads/admin-media/old-image.webp';
    const newUrl = 'https://cdn.example.com/uploads/admin-media/new-image.webp';

    const created = await request(app.getHttpServer())
      .post('/admin/media')
      .send({
        url: oldUrl,
        type: 'IMAGE',
        targetType: 'SHOW',
        targetId: 99,
        isFeatured: false,
      })
      .expect(201);

    const createdId = created.body.id as number;
    expect(typeof createdId).toBe('number');

    const updated = await request(app.getHttpServer())
      .patch(`/admin/media/${createdId}`)
      .send({
        url: newUrl,
      })
      .expect(200);

    expect(updated.body.url).toBe(newUrl);
    expect(r2StorageMock.getKeyFromUrl).toHaveBeenCalledWith(oldUrl);
    expect(r2StorageMock.deleteObject).toHaveBeenCalledWith('admin-media/old-image.webp');
  });

  it('updates media without URL change and does not delete any R2 object', async () => {
    const stableUrl = 'https://cdn.example.com/uploads/admin-media/stable-image.webp';

    const created = await request(app.getHttpServer())
      .post('/admin/media')
      .send({
        url: stableUrl,
        type: 'IMAGE',
        targetType: 'SHOW',
        targetId: 100,
        isFeatured: false,
      })
      .expect(201);

    const createdId = created.body.id as number;

    const updated = await request(app.getHttpServer())
      .patch(`/admin/media/${createdId}`)
      .send({
        url: stableUrl,
        isFeatured: true,
      })
      .expect(200);

    expect(updated.body.url).toBe(stableUrl);
    expect(updated.body.isFeatured).toBe(true);
    expect(r2StorageMock.getKeyFromUrl).not.toHaveBeenCalled();
    expect(r2StorageMock.deleteObject).not.toHaveBeenCalled();
  });
});
