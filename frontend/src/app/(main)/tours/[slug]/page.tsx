'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, CreditCard, Ticket } from 'lucide-react';
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
  branch: { id: number; name: string } | null;
  schedules: TourSchedule[];
}

const scheduleStatusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  OPEN: 'success',
  CLOSED: 'secondary',
  CANCELLED: 'destructive',
};

const scheduleStatusLabels: Record<string, string> = {
  OPEN: 'Còn chỗ',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
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

    toast.success('Đã thêm tour vào giỏ hàng!');
    setSelectedSchedule(schedule.id);
    setTimeout(() => setSelectedSchedule(null), 1000);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-error-500 mb-4">Không thể tải thông tin tour.</p>
          <Link href="/tours">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
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
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* 1. Hero Banner Background */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {(tour.properties?.bannerUrl || tour.properties?.thumbnailUrl) ? (
          <img
            src={(tour.properties?.bannerUrl || tour.properties?.thumbnailUrl) as string}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link 
            href="/tours" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 2. Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100 border border-neutral-100/50">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Tour Hot
                </Badge>
                {tour.branch && (
                  <Badge variant="outline" className="text-neutral-500 border-neutral-200">
                    {tour.branch.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-6">
                {tour.title}
              </h1>

              <div className="flex flex-wrap gap-6 pt-6 border-t border-neutral-100">
                {tour.duration && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Thời lượng</p>
                      <p className="font-semibold text-gray-900">{tour.duration}</p>
                    </div>
                  </div>
                )}
                {tour.destinationLoc && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Hành trình</p>
                      <p className="font-semibold text-gray-900">
                        {tour.departureLoc?.name} &rarr; {tour.destinationLoc.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {tour.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="text-2xl">📝</span> Giới thiệu chương trình
                </h3>
                <div
                  className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tour.description }}
                />
              </div>
            )}

            {/* Tour Inclusions / Exclusions (Properties) */}
            {tour.properties && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Includes */}
                {!!tour.properties.includes && (
                  <div className="bg-green-50/50 rounded-3xl p-6 sm:p-8 border border-green-100">
                    <h3 className="font-display font-bold text-lg text-green-800 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center">
                        <span className="text-green-700 text-xs">✓</span>
                      </div>
                      Bao gồm
                    </h3>
                    <ul className="space-y-3">
                      {String(tour.properties.includes).split(',').map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-neutral-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Excludes */}
                {!!tour.properties.excludes && (
                  <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-100">
                     <h3 className="font-display font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
                        <span className="text-red-700 text-xs">✕</span>
                      </div>
                      Không bao gồm
                    </h3>
                    <ul className="space-y-3">
                      {String(tour.properties.excludes).split(',').map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-neutral-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                 {/* Other Highlights */}
                 {Object.entries(tour.properties)
                    .filter(([key]) => !['includes', 'excludes', 'thumbnailUrl', 'bannerUrl', 'image', 'images'].includes(key))
                    .length > 0 && (
                  <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
                     <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                      <span className="text-2xl">✨</span> Thông tin khác
                    </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(tour.properties)
                        .filter(([key]) => !['includes', 'excludes', 'thumbnailUrl', 'bannerUrl', 'image', 'images'].includes(key))
                        .map(([key, value]) => (
                        <div key={key} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">
                            {key.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 capitalize">{key}</h4>
                            <p className="text-sm text-neutral-600 mt-1">{String(value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                 )}
              </div>
            )}

            {/* Schedules */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
              <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <span className="text-2xl">📅</span> Lịch khởi hành
              </h3>
              
              {tour.schedules.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                  <p className="text-neutral-500">Chưa có lịch khởi hành cho tour này.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {tour.schedules.map((schedule) => {
                    const remaining = schedule.capacity - schedule.bookedCount;
                    const isAvailable = schedule.status === 'OPEN' && remaining > 0;

                    return (
                      <div
                        key={schedule.id}
                        className={`group flex items-center justify-between p-4 border rounded-2xl transition-all ${
                          selectedSchedule === schedule.id 
                            ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500' 
                            : 'border-neutral-200 hover:border-brand-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-lg text-gray-900">
                              {formatDate(schedule.startDate)}
                            </span>
                            <Badge variant={scheduleStatusColors[schedule.status]} className="rounded-md">
                              {scheduleStatusLabels[schedule.status]}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              <span className={remaining < 5 ? "text-orange-500 font-bold" : ""}>
                                Còn {remaining} chỗ
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="h-4 w-4" />
                              <span className="text-brand-600 font-bold">{formatCurrency(schedule.price)}</span>/khách
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => handleAddToCart(schedule)}
                          className={`rounded-xl font-bold transition-all ${
                            selectedSchedule === schedule.id ? 'bg-green-600 hover:bg-green-700' : ''
                          }`}
                        >
                          {!isAvailable
                            ? 'Hết chỗ'
                            : selectedSchedule === schedule.id
                              ? 'Đã thêm ✓'
                              : 'Đặt ngay'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking Widget */}
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-brand-500/10 border border-brand-100">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <Ticket className="h-5 w-5" />
                   </div>
                   <h3 className="font-display font-bold text-xl text-gray-900">Đặt tour ngay</h3>
                </div>

                {openSchedules.length === 0 ? (
                  <div className="text-center py-6 bg-neutral-50 rounded-2xl">
                    <p className="text-sm text-neutral-500">Hiện tại không có lịch khởi hành.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                     {/* Quantity Selector */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 flex justify-between">
                        Số lượng khách
                        <span className="text-brand-600 font-normal">{quantity} người</span>
                      </label>
                      <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center font-display font-bold text-lg">{quantity}</div>
                         <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= 10}
                           className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Quick Schedule Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Lịch sắp tới</label>
                      <div className="space-y-2">
                        {openSchedules.slice(0, 3).map((schedule) => {
                          const remaining = schedule.capacity - schedule.bookedCount;
                          return (
                            <button
                              key={schedule.id}
                              className="w-full group p-3 border border-neutral-200 rounded-xl text-left hover:border-brand-500 hover:bg-brand-50/50 transition-all active:scale-[0.98]"
                              onClick={() => handleAddToCart(schedule)}
                              disabled={remaining < quantity}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-900 group-hover:text-brand-700">
                                  {formatDate(schedule.startDate)}
                                </span>
                                <span className="text-brand-600 font-black">
                                  {formatCurrency(schedule.price * quantity)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-neutral-500">
                                <span>Còn {remaining} chỗ</span>
                                <span>Tổng tiền ({quantity} khách)</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-100">
                      <Link href="/cart" prefetch={false}>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2 hover:bg-neutral-50 hover:text-brand-600">
                          Xem giỏ hàng
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
               {/* Support Card */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white text-center shadow-lg">
                <p className="font-bold text-lg mb-2">Cần tư vấn thêm?</p>
                <p className="text-brand-100 text-sm mb-4">Liên hệ với chúng tôi để được giải đáp thắc mắc về lịch trình.</p>
                 <a href="tel:0912946549" className="inline-block bg-white text-brand-700 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors">
                   Alo ngay: 0912 946 549
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
