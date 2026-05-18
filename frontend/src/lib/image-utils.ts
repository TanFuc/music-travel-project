import { getCloudinaryUrl, ImageSize } from './cloudinary';
type ImageTargetSize =
  | ImageSize
  | {
      w: number;
      h?: number;
    };
const DEFAULT_INLINE_IMAGE_SIZE = { w: 1200 };
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (!trimmedUrl || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) {
    return trimmedUrl;
  }
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }
  return trimmedUrl;
}
export function getOptimizedImageUrl(
  url: string | null | undefined,
  size?: ImageTargetSize,
  quality: string = 'auto'
): string {
  const trimmedUrl = normalizeImageUrl(url);
  if (!trimmedUrl || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) {
    return trimmedUrl;
  }
  return getCloudinaryUrl(trimmedUrl, size, {
    format: 'auto',
    quality,
  });
}
function addImageAttribute(tag: string, name: string, value: string) {
  const attributePattern = new RegExp(`\\s${name}=`, 'i');
  if (attributePattern.test(tag)) return tag;
  return tag.replace(/<img\b/i, `<img ${name}="${value}"`);
}
export function optimizeHtmlImages(
  html: string,
  size: ImageTargetSize = DEFAULT_INLINE_IMAGE_SIZE
) {
  if (!html) return '';
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let nextTag = tag;
    const srcMatch = nextTag.match(/\ssrc=(["'])(.*?)\1/i);
    if (srcMatch?.[2]) {
      const optimizedSrc = getOptimizedImageUrl(srcMatch[2], size);
      nextTag = nextTag.replace(srcMatch[0], ` src=${srcMatch[1]}${optimizedSrc}${srcMatch[1]}`);
    }
    nextTag = addImageAttribute(nextTag, 'loading', 'lazy');
    nextTag = addImageAttribute(nextTag, 'decoding', 'async');
    nextTag = addImageAttribute(nextTag, 'fetchpriority', 'low');
    return nextTag;
  });
}
