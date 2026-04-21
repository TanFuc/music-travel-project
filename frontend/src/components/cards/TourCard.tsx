'use client';
import { memo } from 'react';
import { Link } from '@/components/common/Link';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Tour } from '@/types/api.types';
interface TourCardProps {
  tour: Tour;
}
export const TourCard = memo(function TourCard({ tour }: TourCardProps) {
  const nextSchedule = tour.schedules?.find((s) => s.status === 'OPEN');
  const hasAvailableSlots = nextSchedule && nextSchedule.bookedCount < nextSchedule.capacity;
  return (
    <Card className="card-hover group overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="line-clamp-2 px-4 text-center font-display text-xl font-bold text-white">
            {tour.title}
          </span>
        </div>

        {tour.duration && (
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-white/90 text-neutral-700">
              <Clock className="mr-1 h-3 w-3" />
              {tour.duration}
            </Badge>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-brand-800/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Link href={`/tours/${tour.slug}`}>
            <Button variant="secondary" size="sm">
              Xem chi tiết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-brand-500">
          {tour.title}
        </h3>

        {tour.description && (
          <p className="line-clamp-2 text-sm text-neutral-600">{tour.description}</p>
        )}

        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span className="line-clamp-1">
              {tour.departureLoc?.name || 'N/A'} → {tour.destinationLoc?.name || 'N/A'}
            </span>
          </div>

          {nextSchedule && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-brand-500" />
              <span className="line-clamp-1">Khởi hành: {formatDate(nextSchedule.startDate)}</span>
            </div>
          )}

          {nextSchedule && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0 text-brand-500" />
              <span>
                Còn {nextSchedule.capacity - nextSchedule.bookedCount}/{nextSchedule.capacity} chỗ
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <div>
            {tour.minPrice !== null && (
              <>
                <p className="text-lg font-bold text-brand-600">{formatCurrency(tour.minPrice)}</p>
                <p className="text-xs text-neutral-500">/người</p>
              </>
            )}
          </div>
          <Link href={`/tours/${tour.slug}`}>
            <Button size="sm" disabled={!hasAvailableSlots}>
              {hasAvailableSlots ? 'Đặt tour' : 'Xem'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
TourCard.displayName = 'TourCard';
