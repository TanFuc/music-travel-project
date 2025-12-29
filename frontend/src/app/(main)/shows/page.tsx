'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  performTime: string;
  status: string;
  stage: {
    id: number;
    name: string;
    location: string;
  };
  artists: Array<{
    id: number;
    name: string;
    isHeadline: boolean;
  }>;
  ticketClasses: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  availableTickets: number;
  minPrice: number | null;
}

interface ShowsResponse {
  items: Show[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function ShowsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: () => get<ShowsResponse>('/shows'),
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-error-500">
          Không thể tải danh sách sự kiện. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Sự Kiện Âm Nhạc</h1>
        <p className="text-neutral-600">Khám phá các show nhạc và concert hấp dẫn</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items.map((show) => (
            <Card key={show.id} className="card-hover overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white text-xl font-display font-bold text-center px-4">
                  {show.title}
                </span>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold line-clamp-1">{show.title}</h3>
                  <Badge variant={statusColors[show.status]}>{statusLabels[show.status]}</Badge>
                </div>

                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-500" />
                    <span>{formatDateTime(show.performTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-500" />
                    <span className="line-clamp-1">
                      {show.stage.name}, {show.stage.location}
                    </span>
                  </div>
                  {show.artists.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-500" />
                      <span className="line-clamp-1">
                        {show.artists.map((a) => a.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    {show.minPrice && (
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(show.minPrice)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">Còn {show.availableTickets} vé</p>
                  </div>
                  <Link href={`/shows/${show.slug}`}>
                    <Button size="sm">Xem chi tiết</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.items.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          Chưa có sự kiện nào. Vui lòng quay lại sau.
        </div>
      )}
    </div>
  );
}
