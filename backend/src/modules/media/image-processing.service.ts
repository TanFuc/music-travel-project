import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

// Note: node-vibrant may need to be dynamically imported
// Due to ESM/CommonJS compatibility issues

interface ColorPalette {
  primary: string;
  secondary: string;
  vibrant: string;
  muted: string;
  palette: string[];
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Convert logo: white/light background → transparent circle
   */
  async transformLogoToCircle(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Không thể đọc kích thước ảnh.');
      }

      const size = Math.min(metadata.width, metadata.height);

      // Create circular mask SVG
      const circleMask = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
        </svg>`,
      );

      // Resize to square and apply circular mask
      const result = await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .composite([
          {
            input: circleMask,
            blend: 'dest-in',
          },
        ])
        .png({ quality: 100 })
        .toBuffer();

      this.logger.log(`Transformed logo to circle: ${size}x${size}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to transform logo: ${error}`);
      throw new BadRequestException('Không thể xử lý ảnh logo.');
    }
  }

  /**
   * Extract dominant colors from an image
   */
  async extractColors(imageBuffer: Buffer): Promise<ColorPalette> {
    try {
      // Use sharp to get image stats
      const stats = await sharp(imageBuffer).stats();

      // Extract dominant color from channels
      const r = Math.round(stats.channels[0].mean);
      const g = Math.round(stats.channels[1].mean);
      const b = Math.round(stats.channels[2].mean);

      const primaryHex = this.rgbToHex(r, g, b);

      // Generate variations
      const lighterR = Math.min(255, r + 40);
      const lighterG = Math.min(255, g + 40);
      const lighterB = Math.min(255, b + 40);

      const darkerR = Math.max(0, r - 40);
      const darkerG = Math.max(0, g - 40);
      const darkerB = Math.max(0, b - 40);

      const mutedR = Math.round(r * 0.7 + 128 * 0.3);
      const mutedG = Math.round(g * 0.7 + 128 * 0.3);
      const mutedB = Math.round(b * 0.7 + 128 * 0.3);

      return {
        primary: primaryHex,
        secondary: this.rgbToHex(lighterR, lighterG, lighterB),
        vibrant: this.rgbToHex(darkerR, darkerG, darkerB),
        muted: this.rgbToHex(mutedR, mutedG, mutedB),
        palette: [
          primaryHex,
          this.rgbToHex(lighterR, lighterG, lighterB),
          this.rgbToHex(darkerR, darkerG, darkerB),
          this.rgbToHex(mutedR, mutedG, mutedB),
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to extract colors: ${error}`);
      throw new BadRequestException('Không thể trích xuất màu từ ảnh.');
    }
  }

  /**
   * Resize and optimize image
   */
  async resizeImage(
    imageBuffer: Buffer,
    width: number,
    height?: number,
    format: 'jpeg' | 'png' | 'webp' = 'webp',
  ): Promise<Buffer> {
    try {
      let pipeline = sharp(imageBuffer).resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: 85, progressive: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality: 85 });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality: 85 });
          break;
      }

      return pipeline.toBuffer();
    } catch (error) {
      this.logger.error(`Failed to resize image: ${error}`);
      throw new BadRequestException('Không thể thay đổi kích thước ảnh.');
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(imageBuffer: Buffer, size = 150): Promise<Buffer> {
    try {
      return sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail: ${error}`);
      throw new BadRequestException('Không thể tạo ảnh thumbnail.');
    }
  }

  /**
   * Remove background (using transparency detection approach)
   * For full background removal, consider using external APIs like remove.bg
   */
  async removeWhiteBackground(imageBuffer: Buffer, threshold = 250): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Không thể đọc kích thước ảnh.');
      }

      // Get raw pixel data
      const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

      // Process pixels - make white/near-white pixels transparent
      const newData = Buffer.alloc(data.length);
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check if pixel is white/near-white
        if (r >= threshold && g >= threshold && b >= threshold) {
          // Make transparent
          newData[i] = r;
          newData[i + 1] = g;
          newData[i + 2] = b;
          newData[i + 3] = 0; // Transparent
        } else {
          // Keep original
          newData[i] = r;
          newData[i + 1] = g;
          newData[i + 2] = b;
          newData[i + 3] = a;
        }
      }

      return sharp(newData, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();
    } catch (error) {
      this.logger.error(`Failed to remove background: ${error}`);
      throw new BadRequestException('Không thể xóa nền ảnh.');
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(imageBuffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
        hasAlpha: metadata.hasAlpha || false,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata: ${error}`);
      throw new BadRequestException('Không thể đọc thông tin ảnh.');
    }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
}
