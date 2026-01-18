'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Clock, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Tour {
  id: number;
  title: string;
  slug: string;
  duration: string;
  departureLoc: { name: string } | null;
  destinationLoc: { name: string } | null;
  minPrice: number | null;
  nextSchedule: {
    id: number;
    startDate: string;
    price: number;
  } | null;
}

interface ToursResponse {
  items: Tour[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ToursPage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tours', page],
    queryFn: async () => {
      const response = await get<ToursResponse>(`/tours?page=${page}&limit=${limit}`);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    // console.error('Tours API Error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-error-500">
          Không thể tải danh sách tour. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2">Tour Du Lịch</h1>
        <p className="text-sm sm:text-base text-neutral-600">Khám phá các tour du lịch hấp dẫn trên khắp Việt Nam</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {data?.items?.map((tour) => (
            <Card key={tour.id} className="card-hover overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center">
                <span className="text-white text-xl font-display font-bold text-center px-4">
                  {tour.title}
                </span>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold line-clamp-2">{tour.title}</h3>

                <div className="space-y-2 text-sm text-neutral-600">
                  {tour.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-500" />
                      <span>{tour.duration}</span>
                    </div>
                  )}
                  {tour.destinationLoc && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      <span>
                        {tour.departureLoc?.name} → {tour.destinationLoc.name}
                      </span>
                    </div>
                  )}
                  {tour.nextSchedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-500" />
                      <span>Khởi hành: {formatDate(tour.nextSchedule.startDate)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    {tour.minPrice && (
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(tour.minPrice)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">/ người</p>
                  </div>
                  <Link href={`/tours/${tour.slug}`}>
                    <Button size="sm">Xem chi tiết</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.items?.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          Chưa có tour nào. Vui lòng quay lại sau.
        </div>
      )}
    </div>
  );
}
