'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Show } from '@/types/api.types';

interface ShowCardProps {
  show: Show;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  UPCOMING: 'success',
  ONGOING: 'warning',
  ENDED: 'secondary',
  CANCELLED: 'destructive',
};

const statusLabels: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

export const ShowCard = memo(function ShowCard({ show }: ShowCardProps) {
  const isAvailable = show.status === 'UPCOMING' || show.status === 'ONGOING';

  return (
    <Card className="card-hover overflow-hidden group">
      {/* Image / Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-brand-400 to-brand-600 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-display font-bold text-center px-4 line-clamp-2">
            {show.title}
          </span>
        </div>
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={statusColors[show.status]}>{statusLabels[show.status]}</Badge>
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-brand-800/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link href={`/shows/${show.slug}`}>
            <Button variant="secondary" size="sm">
              Xem chi tiết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold line-clamp-1 group-hover:text-brand-500 transition-colors">
          {show.title}
        </h3>

        {/* Info */}
        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <span className="line-clamp-1">{formatDateTime(show.performTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {show.stage.name}
              {show.stage.location && `, ${show.stage.location.name}`}
            </span>
          </div>
          {show.artists && show.artists.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500 flex-shrink-0" />
              <span className="line-clamp-1">
                {show.artists
                  .filter((a) => a.isHeadline)
                  .map((a) => a.name)
                  .join(', ') ||
                  show.artists.map((a) => a.name).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            {show.minPrice !== null && (
              <p className="text-lg font-bold text-brand-600">
                {formatCurrency(show.minPrice)}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {isAvailable ? `Còn ${show.availableTickets} vé` : 'Hết vé'}
            </p>
          </div>
          <Link href={`/shows/${show.slug}`}>
            <Button size="sm" disabled={!isAvailable}>
              {isAvailable ? 'Đặt vé' : 'Xem'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

ShowCard.displayName = 'ShowCard';
