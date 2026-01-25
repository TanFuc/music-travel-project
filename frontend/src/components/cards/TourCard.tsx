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
    <Card className="card-hover overflow-hidden group">
      {/* Image / Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-display font-bold text-center px-4 line-clamp-2">
            {tour.title}
          </span>
        </div>
        {/* Duration Badge */}
        {tour.duration && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-neutral-700">
              <Clock className="h-3 w-3 mr-1" />
              {tour.duration}
            </Badge>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-brand-800/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link href={`/tours/${tour.slug}`}>
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
          {tour.title}
        </h3>

        {/* Description */}
        {tour.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">{tour.description}</p>
        )}

        {/* Info */}
        <div className="space-y-2 text-sm text-neutral-600">
          {/* Route */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {tour.departureLoc?.name || 'N/A'} → {tour.destinationLoc?.name || 'N/A'}
            </span>
          </div>

          {/* Next Schedule */}
          {nextSchedule && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
              <span className="line-clamp-1">
                Khởi hành: {formatDate(nextSchedule.startDate)}
              </span>
            </div>
          )}

          {/* Available Slots */}
          {nextSchedule && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500 flex-shrink-0" />
              <span>
                Còn {nextSchedule.capacity - nextSchedule.bookedCount}/{nextSchedule.capacity} chỗ
              </span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            {tour.minPrice !== null && (
              <>
                <p className="text-lg font-bold text-brand-600">
                  {formatCurrency(tour.minPrice)}
                </p>
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
