'use client';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from '@/components/shows/WishlistButton';
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
  status?: string;
  stage: {
    name: string;
    location?:
      | {
          name: string;
        }
      | string;
  };
  minPrice: number | null;
  availableTickets?: number;
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
  SOON: { label: '⏰ CHỜ DIỄN', className: 'bg-brand-500/90 text-white shadow-brand-500/20' },
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
  const dateInfo = useMemo(() => {
    try {
      const date = new Date(performTime);
      return {
        day: weekdayFormatter.format(date),
        date: dateFormatter.format(date),
        time: timeFormatter.format(date),
      };
    } catch {
      return { day: '', date: '--/--', time: '--:--' };
    }
  }, [performTime]);
  const displayPrice = useMemo(() => {
    return minPrice ? `${priceFormatter.format(minPrice)}đ` : '---.---đ';
  }, [minPrice]);
  const isSoldOut = useMemo(() => badges.includes('SOLD_OUT'), [badges]);
  const isLowStock = useMemo(
    () => (availableTickets ?? 0) > 0 && (availableTickets ?? 0) < 20,
    [availableTickets]
  );
  const locationName = useMemo(
    () => (typeof stage.location === 'string' ? stage.location : stage.location?.name || 'Unknown'),
    [stage.location]
  );
  const headlineArtist = useMemo(
    () => artists.find((a) => a.isHeadline)?.name || (artists.length > 0 ? artists[0].name : null),
    [artists]
  );
  return (
    <div className="glass-card-premium group relative flex h-full flex-col overflow-hidden border-none">
      <WishlistButton showId={id} showTitle={title} />

      <Link href={`/shows/${slug}`} className="flex h-full flex-1 flex-col">
        <div className="relative aspect-[3/4] shrink-0 overflow-hidden">
          <Image
            src={
              thumbnailUrl ||
              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=600&fit=crop'
            }
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={cn(
                  'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg',
                  badgeConfig[badge]?.className || 'bg-gray-500 text-white'
                )}
              >
                {badgeConfig[badge]?.label || badge}
              </span>
            ))}
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
            {headlineArtist && (
              <Badge className="border-none bg-brand-600 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-white shadow-lg shadow-brand-600/20">
                {headlineArtist}
              </Badge>
            )}

            {isLowStock && !isSoldOut && (
              <div className="rounded-xl border border-white/20 bg-brand-500/90 px-3 py-1 text-center text-[9px] font-bold uppercase tracking-tight text-white shadow-xl backdrop-blur-sm">
                Còn {availableTickets} vé
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 bg-white p-5">
          <h3 className="line-clamp-2 min-h-[3rem] font-display text-xl font-black leading-tight text-gray-900 transition-colors group-hover:text-brand-600">
            {title}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
              <div className="shrink-0 rounded-lg bg-gray-50 p-1.5 text-brand-500">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="line-clamp-1">
                {stage.name} - {locationName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400">
                <Calendar className="h-4 w-4 shrink-0 text-brand-400" />
                <span>{dateInfo.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400">
                <Clock className="h-4 w-4 shrink-0 text-brand-400" />
                <span>{dateInfo.time}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-50 pt-4">
            <div className="flex flex-col">
              <span className="mb-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                Giá từ
              </span>
              <span className="font-display text-2xl font-black leading-none text-brand-600">
                {displayPrice}
              </span>
            </div>

            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all group-hover:bg-brand-600 group-hover:text-white',
                isSoldOut &&
                  'cursor-not-allowed bg-gray-100 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-400'
              )}
            >
              <Ticket className="h-5 w-5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});
