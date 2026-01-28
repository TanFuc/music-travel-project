'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { Heart, MapPin, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowCardProps {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  performTime: string;
  stage: {
    name: string;
    location: { name: string } | string;
  };
  minPrice: number | null;
  availableTickets: number;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
}

const badgeConfig = {
  HOT: { label: '🔥 HOT', className: 'badge-hot' },
  VIP: { label: '⭐ VIP', className: 'badge-vip' },
  NEW: { label: '🆕 MỚI', className: 'badge-new' },
  SOLD_OUT: { label: '❌ HẾT VÉ', className: 'badge-soldout' },
  SOON: { label: '⏰ SẮP DIỄN RA', className: 'bg-orange-500 text-white' },
};

export function ShowCard({
  id,
  title,
  slug,
  thumbnailUrl,
  performTime,
  stage,
  minPrice,
  availableTickets,
  badges = [],
}: ShowCardProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { day: '', date: '', time: '' };
    }
  };

  const dateInfo = formatDate(performTime);
  const isSoldOut = badges.includes('SOLD_OUT');
  const isLowStock = availableTickets > 0 && availableTickets < 20;

  // Use simple placeholders during SSR to avoid hydration mismatch
  const displayDate = mounted ? dateInfo.date : '--/--';
  const displayTime = mounted ? dateInfo.time : '--:--';
  const displayPrice = mounted && minPrice ? `${formatPrice(minPrice)}đ` : '---.---đ';

  const locationName = typeof stage.location === 'string'
    ? stage.location
    : stage.location?.name || 'Unknown';

  return (
    <div className="group glass-card card-hover overflow-hidden border-none h-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden shrink-0">
        <Image
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=600&fit=crop'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay - Lighter & More transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent opacity-60" />

        {/* Wishlist Button */}
        <button
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/40 backdrop-blur-md text-white hover:text-red-500 hover:bg-white shadow-lg transition-all border border-white/20 z-10"
          aria-label="Thêm vào yêu thích"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg',
                  badgeConfig[badge]?.className || 'bg-gray-500 text-white'
                )}
              >
                {badgeConfig[badge]?.label || badge}
              </span>
            ))}
          </div>
        )}

        {/* Low Stock Warning */}
        {isLowStock && !isSoldOut && (
          <div className="absolute bottom-4 left-4 right-4 animate-pulse z-10">
            <div className="px-3 py-2 rounded-xl bg-orange-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-tighter text-center border border-white/20 shadow-xl">
              Chỉ còn {availableTickets} vé!
            </div>
          </div>
        )}
      </div>

      {/* Content area within the glass-card */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Title */}
        <h3 className="font-display font-extrabold text-xl text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight min-h-[3rem]">
          {title}
        </h3>

        {/* Info Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="line-clamp-1">{stage.name} - {locationName}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-gray-400 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-400 text-xs font-semibold">
              <Clock className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{displayTime}</span>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Giá từ</span>
            {minPrice ? (
              <span className="font-display font-black text-2xl text-brand-600 leading-none">
                {displayPrice}
              </span>
            ) : (
              <span className="text-gray-500 font-bold">Liên hệ</span>
            )}
          </div>

          <Link
            href={`/shows/${slug}`}
            className={cn(
              'px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl',
              isSoldOut
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : 'btn-primary'
            )}
          >
            {isSoldOut ? 'HẾT VÉ' : 'ĐẶT CHỖ'}
          </Link>
        </div>
      </div>
    </div>
  );
}
