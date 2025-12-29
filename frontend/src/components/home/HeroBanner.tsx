'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Mock data for development
const mockBanners: Banner[] = [
  {
    id: 1,
    title: 'Đêm Nhạc Trịnh - Thung Lũng Mây',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&h=1080&fit=crop',
    actionLink: '/shows/dem-nhac-trinh',
  },
  {
    id: 2,
    title: 'Acoustic Night - Mây In The Nest',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&h=1080&fit=crop',
    actionLink: '/shows/acoustic-night',
  },
  {
    id: 3,
    title: 'Tour Đà Lạt 3N2Đ - Combo Show',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    actionLink: '/tours/da-lat-combo',
  },
];

export function HeroBanner({ banners = mockBanners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative h-screen w-full overflow-hidden">
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
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Particles Background */}
      <div className="particles-bg" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-brand-400">✨</span>
              <span className="text-sm font-medium text-white">Show Đặc Biệt</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              {currentBanner.title}
            </h1>

            {/* Details */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                <span>Thung Lũng Mây - Đà Lạt</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-400" />
                <span>29/12/2024 | 20:00</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href={currentBanner.actionLink}
                className="btn-neon inline-flex items-center gap-2 text-lg"
              >
                <span>💳</span>
                <span>ĐẶT VÉ NGAY - Từ 350,000đ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card text-white hover:bg-white/20 transition-all"
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
              'w-3 h-3 rounded-full transition-all',
              index === currentIndex
                ? 'bg-brand-500 w-8'
                : 'bg-white/30 hover:bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
