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
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="section-title flex items-center justify-center gap-2">
            <span className="text-xl md:text-2xl">🌄</span>
            <span className="text-xl md:text-3xl font-bold">TOUR DU LỊCH KẾT HỢP SHOW</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
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
          <div className="grid grid-cols-1 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group block border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row bg-white">
                  {/* Image */}
                  <div className="relative md:w-1/3 aspect-video md:aspect-auto min-h-[220px]">
                    <Image
                      src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
                      alt={tour.title}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                          {tour.duration}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl lg:text-2xl text-gray-900 mb-4 leading-tight">
                        {tour.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-500" />
                          <span>Từ: {tour.departureLoc.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          <span>Đến: {tour.destinationLoc.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-brand-600 font-bold text-xl">
                          {tour.minPrice ? formatPrice(tour.minPrice) : 'Liên hệ'}
                        </span>
                        <span className="text-gray-400 text-[10px] font-medium">VND / người</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        Chi tiết <ArrowRight className="w-4 h-4" />
                      </div>
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-sm text-gray-700 font-medium group"
          >
            XEM TẤT CẢ TOUR
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
