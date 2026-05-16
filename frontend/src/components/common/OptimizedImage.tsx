'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  quality = 80,
  priority = false,
  loading,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  blurPlaceholder,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Build responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill
      ? '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  );

  return (
    <div className={cn('relative overflow-hidden', !fill && 'w-full h-full', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        quality={quality}
        priority={priority}
        loading={loading || (priority ? 'eager' : 'lazy')}
        sizes={responsiveSizes}
        placeholder={blurPlaceholder ? 'blur' : 'empty'}
        blurDataURL={blurPlaceholder}
        onLoadingComplete={handleLoadingComplete}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          `object-${objectFit}`,
          objectPosition !== 'center' && `object-[${objectPosition}]`
        )}
        decoding="async"
      />

      {/* Skeleton loader while image loads */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  );
}
