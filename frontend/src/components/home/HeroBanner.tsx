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
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners', 'HOME_MAIN_SLIDER'],
    queryFn: async () => {
      const response = await get<Banner[]>('/banners?position=HOME_MAIN_SLIDER&isActive=true');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: true,
    initialData: propBanners,
  });
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);
  const goToNext = useCallback(() => {
    const newIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, banners.length, goToSlide]);
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);
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
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
      </section>
    );
  }
  if (banners.length === 0) {
    return (
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gray-100">
        <div className="text-center text-gray-500">
          <p className="text-lg">Chưa có banner nào</p>
        </div>
      </section>
    );
  }
  const currentBanner = banners[currentIndex];
  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-neutral-900 md:h-screen">
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
            className={cn('object-cover', index === currentIndex && 'ken-burns')}
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            sizes="100vw"
            quality={75}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 opacity-90" />

      <div className="particles-bg opacity-30" />

      <div className="pt-header absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6 md:space-y-8">
            <div className="animate-fadeIn stagger-1 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 shadow-xl backdrop-blur-md sm:px-4 sm:py-2">
              <span className="text-brand-400">✨</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">
                Show Đặc Biệt
              </span>
            </div>

            <h1 className="animate-fadeIn stagger-2 font-display text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {currentBanner.title}
            </h1>

            <div className="animate-fadeIn stagger-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
                <MapPin className="h-4 w-4 text-brand-400" />
                <span className="text-xs font-semibold text-white sm:text-sm">
                  Thung Lũng Mây - Đà Lạt
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
                <Calendar className="h-4 w-4 text-brand-400" />
                <span className="text-xs font-semibold text-white sm:text-sm">
                  29/12/2024 | 20:00
                </span>
              </div>
            </div>

            <div className="animate-fadeIn stagger-4 pt-4 sm:pt-8">
              <Link
                href={currentBanner.actionLink}
                className="btn-neon inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base shadow-2xl transition-transform active:scale-95 sm:px-10 sm:py-5 sm:text-lg"
              >
                <span>ĐẶT VÉ NGAY</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-brand-600 shadow-lg backdrop-blur-sm transition-all hover:bg-brand-500 hover:text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-brand-600 shadow-lg backdrop-blur-sm transition-all hover:bg-brand-500 hover:text-white"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-3 w-3 rounded-full shadow-sm transition-all',
              index === currentIndex
                ? 'w-8 bg-brand-500 shadow-glow'
                : 'bg-white/70 hover:bg-brand-200'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-brand-300 bg-white/50 pt-2">
          <div className="h-2 w-1 rounded-full bg-brand-500" />
        </div>
      </div>
    </section>
  );
}
