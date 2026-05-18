'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, normalizeImageUrl } from '@/lib/image-utils';
import type { ImageSize } from '@/lib/cloudinary';
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  objectPosition?: string;
  blurPlaceholder?: string;
  imageSize?:
    | ImageSize
    | {
        w: number;
        h?: number;
      };
}
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  quality: _quality = 80,
  priority = false,
  loading,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  blurPlaceholder,
  imageSize,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const originalSrc = useMemo(() => normalizeImageUrl(src), [src]);
  const optimizedSrc = useMemo(
    () => getOptimizedImageUrl(src, imageSize || (priority ? 'hero' : 'large')),
    [imageSize, priority, src]
  );
  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);
  useEffect(() => {
    setIsLoading(true);
    setCurrentSrc(optimizedSrc);
  }, [optimizedSrc]);
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoading(false);
    }
  }, [currentSrc]);
  const finishLoading = () => {
    setIsLoading(false);
  };
  const handleError = () => {
    if (currentSrc !== originalSrc && originalSrc) {
      setCurrentSrc(originalSrc);
      return;
    }
    finishLoading();
  };
  const responsiveSizes =
    sizes ||
    (fill
      ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? undefined : loading || 'lazy'}
        sizes={responsiveSizes}
        onLoad={finishLoading}
        onError={handleError}
        className={cn(
          fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full',
          `object-${objectFit}`,
          objectPosition !== 'center' && `object-[${objectPosition}]`
        )}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{
          objectPosition,
          backgroundImage: blurPlaceholder ? `url("${blurPlaceholder}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
}
