'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
import { useState } from 'react';

interface TourSchedule {
  id: number;
  startDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: string;
}

interface TourDetail {
  id: number;
  title: string;
  slug: string;
  duration: string | null;
  description: string | null;
  properties: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  departureLoc: {
    id: number;
    name: string;
  } | null;
  destinationLoc: {
    id: number;
    name: string;
  } | null;
  schedules: TourSchedule[];
}

const scheduleStatusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  OPEN: 'success',
  CLOSED: 'secondary',
  CANCELLED: 'destructive',
};

const scheduleStatusLabels: Record<string, string> = {
  OPEN: 'Con cho',
  CLOSED: 'Da dong',
  CANCELLED: 'Da huy',
};

export default function TourDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addTour = useCartStore((state) => state.addTour);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: tour, isLoading, error } = useQuery({
    queryKey: ['tour', slug],
    queryFn: () => get<TourDetail>(`/tours/${slug}`),
    enabled: !!slug,
  });

  const handleAddToCart = (schedule: TourSchedule) => {
    if (!tour) return;

    addTour({
      scheduleId: schedule.id,
      tourId: tour.id,
      tourTitle: tour.title,
      startDate: schedule.startDate,
      price: schedule.price,
      quantity,
    });

    toast.success('Da them tour vao gio hang!');
    setSelectedSchedule(schedule.id);
    setTimeout(() => setSelectedSchedule(null), 1000);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-error-500 mb-4">Khong the tai thong tin tour.</p>
          <Link href="/tours">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lai danh sach
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tour) return null;

  const openSchedules = tour.schedules.filter((s) => s.status === 'OPEN');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/tours" className="inline-flex items-center text-neutral-600 hover:text-brand-500 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lai danh sach
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 text-white p-8 md:p-12">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{tour.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                {tour.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{tour.duration}</span>
                  </div>
                )}
                {tour.destinationLoc && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {tour.departureLoc?.name} &rarr; {tour.destinationLoc.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {tour.description && (
            <Card>
              <CardHeader>
                <CardTitle>Gioi thieu chuong trinh</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: tour.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tour Highlights */}
          {tour.properties && (
            <Card>
              <CardHeader>
                <CardTitle>Diem noi bat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(tour.properties).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-600 text-sm font-bold">
                          {key.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{key}</h4>
                        <p className="text-sm text-neutral-600">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lich khoi hanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tour.schedules.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">Chua co lich khoi hanh.</p>
              ) : (
                <div className="space-y-3">
                  {tour.schedules.map((schedule) => {
                    const remaining = schedule.capacity - schedule.bookedCount;
                    const isAvailable = schedule.status === 'OPEN' && remaining > 0;

                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatDate(schedule.startDate)}</span>
                            <Badge variant={scheduleStatusColors[schedule.status]}>
                              {scheduleStatusLabels[schedule.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Con {remaining}/{schedule.capacity} cho
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              {formatCurrency(schedule.price)}/nguoi
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={!isAvailable || selectedSchedule === schedule.id}
                          onClick={() => handleAddToCart(schedule)}
                        >
                          {!isAvailable
                            ? 'Het cho'
                            : selectedSchedule === schedule.id
                              ? 'Da them!'
                              : 'Dat ngay'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Dat tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {openSchedules.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-neutral-500">Hien tai khong co lich khoi hanh nao.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">So nguoi</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chon lich khoi hanh</label>
                    <div className="space-y-2">
                      {openSchedules.slice(0, 3).map((schedule) => {
                        const remaining = schedule.capacity - schedule.bookedCount;

                        return (
                          <button
                            key={schedule.id}
                            className="w-full p-3 border rounded-lg text-left hover:border-brand-500 transition-colors"
                            onClick={() => handleAddToCart(schedule)}
                            disabled={remaining < quantity}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{formatDate(schedule.startDate)}</span>
                              <span className="text-brand-600 font-bold">
                                {formatCurrency(schedule.price * quantity)}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500">
                              Con {remaining} cho | {quantity} nguoi
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Link href="/cart">
                      <Button variant="outline" className="w-full">
                        Xem gio hang
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
