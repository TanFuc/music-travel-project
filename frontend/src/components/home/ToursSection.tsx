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
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-orange-100 text-2xl animate-bounce-slow">
              🌄
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-4 tracking-tight">
              TOUR DU LỊCH <span className="text-orange-500">KẾT HỢP SHOW</span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm trọn vẹn: Du lịch khám phá kết hợp thưởng thức show diễn đỉnh cao. 
              <span className="font-semibold text-orange-600 ml-1">Combo tiết kiệm đến 30%</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1.5 rounded-lg bg-orange-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                        Combo Hot
                     </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                     <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        {tour.duration}
                     </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {tour.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                         <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="font-medium">Khởi hành:</span>
                      <span className="text-gray-900">{tour.departureLoc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                         <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                       <span className="font-medium">Điểm đến:</span>
                       <span className="text-gray-900">{tour.destinationLoc.name}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Giá trọn gói từ</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-orange-600">
                          {tour.minPrice ? formatPrice(tour.minPrice) : 'Liên hệ'}
                        </span>
                        <span className="text-xs font-bold text-gray-400">₫</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="w-5 h-5" />
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
