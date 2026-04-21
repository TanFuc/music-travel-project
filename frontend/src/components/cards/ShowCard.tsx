'use client';
import { memo } from 'react';
import { Link } from '@/components/common/Link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Show } from '@/types/api.types';
interface ShowCardProps {
  show: Show;
}
const statusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning'
> = {
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
    <Card className="card-hover group overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="line-clamp-2 px-4 text-center font-display text-xl font-bold text-white">
            {show.title}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <Badge variant={statusColors[show.status]}>{statusLabels[show.status]}</Badge>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-brand-800/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Link href={`/shows/${show.slug}`}>
            <Button variant="secondary" size="sm">
              Xem chi tiết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-brand-500">
          {show.title}
        </h3>

        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span className="line-clamp-1">{formatDateTime(show.performTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span className="line-clamp-1">
              {show.stage.name}
              {show.stage.location && `, ${show.stage.location.name}`}
            </span>
          </div>
          {show.artists && show.artists.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0 text-brand-500" />
              <span className="line-clamp-1">
                {show.artists
                  .filter((a) => a.isHeadline)
                  .map((a) => a.name)
                  .join(', ') || show.artists.map((a) => a.name).join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <div>
            {show.minPrice !== null && (
              <p className="text-lg font-bold text-brand-600">{formatCurrency(show.minPrice)}</p>
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
