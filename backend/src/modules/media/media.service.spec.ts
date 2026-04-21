import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
describe('MediaService', () => {
  const prisma = {
    media: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  } as any;
  const r2StorageService = {
    uploadBuffer: jest.fn(),
    getKeyFromUrl: jest.fn(),
    deleteObject: jest.fn(),
  } as any;
  const imageProcessingService = {
    optimizeForUpload: jest.fn(),
  } as any;
  let service: MediaService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new MediaService(prisma, r2StorageService, imageProcessingService);
  });
  it('rejects non-image file upload', async () => {
    await expect(
      service.uploadImage({ buffer: Buffer.from('x'), mimetype: 'application/pdf' }, 'media'),
    ).rejects.toThrow(BadRequestException);
  });
  it('optimizes and uploads image to R2', async () => {
    imageProcessingService.optimizeForUpload.mockResolvedValue({
      buffer: Buffer.from('optimized'),
      width: 800,
      height: 450,
      size: 12345,
      contentType: 'image/webp',
      extension: 'webp',
    });
    r2StorageService.uploadBuffer.mockResolvedValue({
      key: 'banners/file.webp',
      url: 'https://cdn.example.com/banners/file.webp',
    });
    const result = await service.uploadImage(
      {
        buffer: Buffer.from('raw-image'),
        mimetype: 'image/jpeg',
      },
      'banners',
    );
    expect(imageProcessingService.optimizeForUpload).toHaveBeenCalledWith(Buffer.from('raw-image'));
    expect(r2StorageService.uploadBuffer).toHaveBeenCalledWith({
      buffer: Buffer.from('optimized'),
      folder: 'banners',
      fileExtension: 'webp',
      contentType: 'image/webp',
    });
    expect(result.url).toBe('https://cdn.example.com/banners/file.webp');
    expect(result.width).toBe(800);
    expect(result.height).toBe(450);
  });
  it('deletes object from R2 when media is removed', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: 1,
      url: 'https://cdn.example.com/banners/file.webp',
    });
    prisma.media.delete.mockResolvedValue({ id: 1 });
    r2StorageService.getKeyFromUrl.mockReturnValue('banners/file.webp');
    await service.delete(1);
    expect(r2StorageService.deleteObject).toHaveBeenCalledWith('banners/file.webp');
    expect(prisma.media.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
