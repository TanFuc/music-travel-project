import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { R2StorageService } from './r2-storage.service';
jest.mock('@aws-sdk/client-s3', () => {
  const send = jest.fn();
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send })),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ input, type: 'put' })),
    DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ input, type: 'delete' })),
  };
});
describe('R2StorageService', () => {
  const sendMock = jest.fn();
  function createService(overrides: Record<string, string | undefined> = {}) {
    const values: Record<string, string | undefined> = {
      'r2.bucket': 'media-bucket',
      'r2.endpoint': 'https://account.r2.cloudflarestorage.com',
      'r2.publicUrl': 'https://cdn.example.com/',
      'r2.region': 'auto',
      'r2.accessKeyId': 'access-key',
      'r2.secretAccessKey': 'secret-key',
      ...overrides,
    };
    return new R2StorageService({
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService);
  }
  beforeEach(() => {
    jest.clearAllMocks();
    (S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }));
    sendMock.mockResolvedValue({});
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('uploads a buffer to R2 and returns a public URL', async () => {
    const service = createService();
    const result = await service.uploadBuffer({
      buffer: Buffer.from('image'),
      folder: '/admin-media/',
      fileExtension: '.webp',
      contentType: 'image/webp',
    });
    expect(result.key).toMatch(/^admin-media\/1710000000000-/);
    expect(result.key.endsWith('.webp')).toBe(true);
    expect(result.url).toBe(`https://cdn.example.com/${result.key}`);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'media-bucket',
      Key: result.key,
      Body: Buffer.from('image'),
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
  it('falls back to endpoint bucket URL when no public URL is configured', async () => {
    const service = createService({ 'r2.publicUrl': undefined });
    const result = await service.uploadBuffer({
      buffer: Buffer.from('image'),
      folder: 'shows',
    });
    expect(result.url).toBe(`https://account.r2.cloudflarestorage.com/media-bucket/${result.key}`);
  });
  it('extracts object keys from public and fallback R2 URLs', () => {
    const service = createService();
    expect(service.getKeyFromUrl('https://cdn.example.com/admin-media/file.webp')).toBe(
      'admin-media/file.webp',
    );
    expect(
      service.getKeyFromUrl(
        'https://account.r2.cloudflarestorage.com/media-bucket/admin-media/file.webp',
      ),
    ).toBe('admin-media/file.webp');
    expect(service.getKeyFromUrl('https://other.example.com/admin-media/file.webp')).toBeNull();
  });
  it('deletes an object by key', async () => {
    const service = createService();
    await service.deleteObject('admin-media/file.webp');
    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: 'media-bucket',
      Key: 'admin-media/file.webp',
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
