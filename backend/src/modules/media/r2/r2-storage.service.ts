import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
interface UploadBufferParams {
  buffer: Buffer;
  folder?: string;
  fileExtension?: string;
  contentType?: string;
}
@Injectable()
export class R2StorageService {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicUrl?: string;
  private readonly client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.bucket = this.requireConfig('r2.bucket');
    this.endpoint = this.requireConfig('r2.endpoint');
    this.publicUrl = this.configService.get<string>('r2.publicUrl')?.replace(/\/$/, '');
    this.client = new S3Client({
      region: this.configService.get<string>('r2.region') || 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.requireConfig('r2.accessKeyId'),
        secretAccessKey: this.requireConfig('r2.secretAccessKey'),
      },
      forcePathStyle: true,
    });
  }
  async uploadBuffer(params: UploadBufferParams) {
    const folder = this.normalizeFolder(params.folder || 'music-travel');
    const extension = (params.fileExtension || 'webp').replace('.', '').toLowerCase();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: params.buffer,
          ContentType: params.contentType || 'application/octet-stream',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      return {
        key,
        url: this.buildPublicUrl(key),
      };
    } catch (error) {
      throw new InternalServerErrorException(`R2 upload failed: ${(error as Error).message}`);
    }
  }
  async deleteObject(key: string) {
    if (!key) {
      return;
    }
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(`R2 delete failed: ${(error as Error).message}`);
    }
  }
  getKeyFromUrl(url: string): string | null {
    if (!url) {
      return null;
    }
    if (this.publicUrl && url.startsWith(`${this.publicUrl}/`)) {
      return url.replace(`${this.publicUrl}/`, '');
    }
    const fallbackPrefix = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/`;
    if (url.startsWith(fallbackPrefix)) {
      return url.replace(fallbackPrefix, '');
    }
    return null;
  }
  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }
  private normalizeFolder(folder: string): string {
    return folder.replace(/^\/+|\/+$/g, '') || 'music-travel';
  }
  private requireConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
    return value;
  }
}
