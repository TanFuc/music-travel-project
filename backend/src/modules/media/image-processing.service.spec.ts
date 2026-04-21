import * as sharp from 'sharp';
import { ImageProcessingService } from './image-processing.service';
describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  beforeEach(() => {
    service = new ImageProcessingService();
  });
  it('optimizes upload image to webp with bounded dimensions', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 3000,
        height: 1800,
        channels: 3,
        background: { r: 120, g: 160, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();
    const optimized = await service.optimizeForUpload(inputBuffer, {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 80,
    });
    const metadata = await sharp(optimized.buffer).metadata();
    expect(optimized.contentType).toBe('image/webp');
    expect(optimized.extension).toBe('webp');
    expect(metadata.format).toBe('webp');
    expect((metadata.width || 0) <= 1000).toBe(true);
    expect((metadata.height || 0) <= 1000).toBe(true);
    expect(optimized.size).toBe(optimized.buffer.length);
  });
  it('throws on invalid binary input', async () => {
    await expect(service.optimizeForUpload(Buffer.from('not-an-image'))).rejects.toThrow(
      'Không thể tối ưu ảnh trước khi tải lên.',
    );
  });
});
