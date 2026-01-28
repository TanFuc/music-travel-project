'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Calendar, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { get } from '@/lib/api';

interface Tour {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  duration: string;
  departureLoc: { name: string };
  destinationLoc: { name: string };
  minPrice: number | null;
  nextSchedule?: {
    startDate: string;
    price: number;
    availableSlots: number;
  };
}

export function ToursSection() {
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['home-tours'],
    queryFn: async () => {
      const response = await get<{ items: Tour[]; meta: unknown }>('/tours?limit=2');
      return response.items || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="section-title flex items-center justify-center gap-3">
            <span className="text-3xl">🌄</span>
            TOUR DU LỊCH KẾT HỢP SHOW
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Đến Đà Lạt - Xem show - Trải nghiệm trọn vẹn. Combo tour + vé show tiết kiệm đến 30%
          </p>
        </div>

        {/* Tours List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có tour nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tours.map((tour, index) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group block glass-card card-hover overflow-hidden animate-fadeIn opacity-0 border-none"
                style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="relative lg:w-2/5 aspect-video lg:aspect-auto overflow-hidden">
                    <Image
                      src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'}
                      alt={tour.title}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Clock className="w-3 h-3" />
                        {tour.duration}
                      </div>
                      <h3 className="font-display font-black text-2xl lg:text-3xl text-gray-900 group-hover:text-brand-600 transition-colors mb-6 leading-tight">
                        {tour.title}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-500 shadow-sm">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm đi</span>
                            <span className="text-sm font-bold text-gray-700">{tour.departureLoc.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm đến</span>
                            <span className="text-sm font-bold text-gray-700">{tour.destinationLoc.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">Giá từ</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display font-black text-3xl text-brand-600">
                            {tour.minPrice ? formatPrice(tour.minPrice) : 'Liên hệ'}
                          </span>
                          <span className="text-gray-900 font-bold text-xs">VND</span>
                          <span className="text-gray-400 text-xs font-medium ml-1">/ người</span>
                        </div>
                      </div>

                      <span className="px-8 py-4 rounded-2xl btn-primary inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl">
                        KHÁM PHÁ NGAY
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-gray-700 font-medium group"
          >
            XEM TẤT CẢ TOUR
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
