/**
 * Cloudinary URL Helper
 * Provides consistent image sizes and optimization
 */

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'hero' | 'avatar';

const SIZES: Record<ImageSize, { w: number; h?: number }> = {
  thumbnail: { w: 150, h: 150 },
  small: { w: 300 },
  medium: { w: 600 },
  large: { w: 1000 },
  hero: { w: 1920, h: 1080 },
  avatar: { w: 100, h: 100 },
};

export function getCloudinaryUrl(
  url: string | null | undefined,
  size?: ImageSize | { w: number; h?: number },
  options: {
    crop?: string;
    gravity?: string;
    format?: string;
    quality?: string;
  } = {}
): string {
  if (!url) return '';

  // Only transform if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) return url;

  const {
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
  } = options;

  let width = 0;
  let height: number | undefined;

  if (typeof size === 'string') {
    width = SIZES[size].w;
    height = SIZES[size].h;
  } else if (size) {
    width = size.w;
    height = size.h;
  }

  // Parse Cloudinary URL to inject transformations
  // Format typically: https://res.cloudinary.com/[id]/image/upload/[transformations]/v[version]/[publicId].[ext]
  const baseUrl = url.split('/upload/')[0];
  const rest = url.split('/upload/')[1];

  const transformations = [
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    `c_${crop}`,
    `g_${gravity}`,
    `f_${format}`,
    `q_${quality}`,
  ].filter(Boolean).join(',');

  return `${baseUrl}/upload/${transformations}/${rest}`;
}
