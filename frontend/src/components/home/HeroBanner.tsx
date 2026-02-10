'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { get } from '@/lib/api';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string;
  actionLink: string;
}

interface HeroBannerProps {
  banners?: Banner[];
}

export function HeroBanner({ banners: propBanners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use React Query instead of manual fetch
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners', 'HOME_MAIN_SLIDER'],
    queryFn: async () => {
      const response = await get<Banner[]>('/banners?position=HOME_MAIN_SLIDER&isActive=true');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: true,
    initialData: propBanners,
  });

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (isLoading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">Chưa có banner nào</p>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-neutral-900">
      {/* Background Image with Ken Burns Effect */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title || 'Banner'}
            fill
            className={cn(
              'object-cover',
              index === currentIndex && 'ken-burns'
            )}
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            sizes="100vw"
            quality={75}
          />
        </div>
      ))}

      {/* Lighter Gradient Overlay for readability but keeping it airy */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 opacity-90" />

      {/* Particles Background */}
      <div className="particles-bg opacity-30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center pt-header">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-xl animate-fadeIn stagger-1">
              <span className="text-brand-400">✨</span>
              <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">Show Đặc Biệt</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[1.1] tracking-tight animate-fadeIn stagger-2">
              {currentBanner.title}
            </h1>

            {/* Details */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 animate-fadeIn stagger-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span className="text-white text-xs sm:text-sm font-semibold">Thung Lũng Mây - Đà Lạt</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span className="text-white text-xs sm:text-sm font-semibold">29/12/2024 | 20:00</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 sm:pt-8 animate-fadeIn stagger-4">
              <Link
                href={currentBanner.actionLink}
                className="btn-neon inline-flex items-center gap-3 text-base sm:text-lg px-8 py-4 sm:px-10 sm:py-5 rounded-2xl shadow-2xl active:scale-95 transition-transform"
              >
                <span>ĐẶT VÉ NGAY</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-brand-600 hover:bg-brand-500 hover:text-white transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-brand-600 hover:bg-brand-500 hover:text-white transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-3 h-3 rounded-full transition-all shadow-sm',
              index === currentIndex
                ? 'bg-brand-500 w-8 shadow-glow'
                : 'bg-white/70 hover:bg-brand-200'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-brand-300 flex justify-center pt-2 bg-white/50">
          <div className="w-1 h-2 rounded-full bg-brand-500" />
        </div>
      </div>
    </section>
  );
}
