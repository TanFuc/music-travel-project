'use client';

import Image from 'next/image';
import Link from 'next/link';
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
    location: { name: string };
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const dateInfo = formatDate(performTime);
  const isSoldOut = badges.includes('SOLD_OUT');
  const isLowStock = availableTickets > 0 && availableTickets < 20;

  return (
    <div className="group glass-card card-hover overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=600&fit=crop'}
          alt={title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay - Bright green theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-700/70 via-transparent to-transparent" />

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-brand-500 hover:text-accent-600 hover:bg-white shadow-md transition-all"
          aria-label="Thêm vào yêu thích"
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={cn(
                  'px-2 py-1 rounded text-xs font-bold',
                  badgeConfig[badge].className
                )}
              >
                {badgeConfig[badge].label}
              </span>
            ))}
          </div>
        )}

        {/* Low Stock Warning */}
        {isLowStock && !isSoldOut && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="px-3 py-1.5 rounded-lg bg-orange-500/90 backdrop-blur-sm text-white text-sm font-medium text-center">
              Chỉ còn {availableTickets} vé!
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 bg-white">
        {/* Title */}
        <h3 className="font-display font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 text-brand-500" />
          <span className="line-clamp-1">
            {stage.name} - {stage.location.name}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>{dateInfo.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>{dateInfo.time}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <div>
            {minPrice ? (
              <>
                <span className="text-gray-400 text-sm">Từ</span>
                <span className="ml-1 font-accent font-bold text-xl text-brand-600">
                  {formatPrice(minPrice)}đ
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">Liên hệ</span>
            )}
          </div>

          <Link
            href={`/shows/${slug}`}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              isSoldOut
                ? 'bg-neutral-600 text-white/50 cursor-not-allowed'
                : 'btn-primary'
            )}
          >
            {isSoldOut ? 'Hết vé' : 'Đặt chỗ'}
          </Link>
        </div>
      </div>
    </div>
  );
}
