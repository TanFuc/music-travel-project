'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { Heart, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Memoize formatters outside component to avoid recreation
const priceFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });
const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' });
const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

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
  artists?: {
    name: string;
    isHeadline: boolean;
  }[];
}

const badgeConfig = {
  HOT: { label: '🔥 HOT', className: 'badge-hot' },
  VIP: { label: '⭐ VIP', className: 'badge-vip' },
  NEW: { label: '🆕 MỚI', className: 'badge-new' },
  SOLD_OUT: { label: '❌ HẾT VÉ', className: 'badge-soldout' },
  SOON: { label: '⏰ SẮP DIỄN RA', className: 'bg-orange-500 text-white' },
};

export const ShowCard = React.memo(function ShowCard({
  id,
  title,
  slug,
  thumbnailUrl,
  performTime,
  stage,
  minPrice,
  availableTickets,
  badges = [],
  artists = [],
}: ShowCardProps) {
  // Memoize date formatting calculations
  const dateInfo = useMemo(() => {
    try {
      const date = new Date(performTime);
      return {
        day: weekdayFormatter.format(date),
        date: dateFormatter.format(date),
        time: timeFormatter.format(date),
      };
    } catch (e) {
      return { day: '', date: '--/--', time: '--:--' };
    }
  }, [performTime]);

  // Memoize price formatting
  const displayPrice = useMemo(() => {
    return minPrice ? `${priceFormatter.format(minPrice)}đ` : '---.---đ';
  }, [minPrice]);

  // Memoize derived values
  const isSoldOut = useMemo(() => badges.includes('SOLD_OUT'), [badges]);
  const isLowStock = useMemo(() => availableTickets > 0 && availableTickets < 20, [availableTickets]);

  const locationName = useMemo(() =>
    typeof stage.location === 'string'
      ? stage.location
      : stage.location?.name || 'Unknown',
    [stage.location]
  );

  const headlineArtist = useMemo(() => 
    artists.find(a => a.isHeadline)?.name || (artists.length > 0 ? artists[0].name : null),
  [artists]);

  return (
    <div className="group glass-card-premium overflow-hidden border-none h-full flex flex-col relative">
      <button
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/40 backdrop-blur-md text-white hover:text-red-500 hover:bg-white shadow-lg transition-all border border-white/20 z-20"
        aria-label="Thêm vào yêu thích"
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
      >
        <Heart className="w-5 h-5" />
      </button>

      <Link href={`/shows/${slug}`} className="flex flex-col h-full flex-1">
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Badges */}
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

          {/* Bottom info on Image */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
            {headlineArtist && (
              <Badge className="bg-brand-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-brand-600/20">
                {headlineArtist}
              </Badge>
            )}
            
            {isLowStock && !isSoldOut && (
              <div className="px-3 py-1 rounded-xl bg-orange-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-tight text-center border border-white/20 shadow-xl">
                Còn {availableTickets} vé
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 flex flex-col flex-1 gap-4 bg-white">
          <h3 className="font-display font-black text-xl text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight min-h-[3rem]">
            {title}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
              <div className="p-1.5 rounded-lg bg-gray-50 text-brand-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="line-clamp-1">{stage.name} - {locationName}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 text-gray-400 text-xs font-bold">
                <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{dateInfo.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400 text-xs font-bold">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{dateInfo.time}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-0.5">Giá từ</span>
              <span className="font-display font-black text-2xl text-brand-600 leading-none">
                {displayPrice}
              </span>
            </div>

            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white',
                isSoldOut && 'bg-gray-100 text-gray-400 cursor-not-allowed group-hover:bg-gray-100 group-hover:text-gray-400'
              )}
            >
              <Ticket className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});
