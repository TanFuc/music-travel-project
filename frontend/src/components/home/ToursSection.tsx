'use client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { get } from '@/lib/api';
import { OptimizedImage } from '@/components/common/OptimizedImage';
interface Tour {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  duration: string;
  departureLoc: {
    name: string;
  };
  destinationLoc: {
    name: string;
  };
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
      const response = await get<{
        items: Tour[];
        meta: unknown;
      }>('/tours/regular?limit=2');
      return response.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="animate-bounce-slow mb-4 inline-flex items-center justify-center rounded-2xl bg-orange-100 p-3 text-2xl">
            🌄
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            TOUR DU LỊCH <span className="text-orange-500">SINH THÁI</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            Khám phá thiên nhiên xanh qua những hành trình được thiết kế riêng cho trải nghiệm sinh
            thái.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : tours.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">Chưa có tour nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <OptimizedImage
                    src={
                      tour.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
                    }
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    quality={85}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    blurPlaceholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23e5e7eb' width='800' height='450'/%3E%3C/svg%3E"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-lg bg-orange-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                      Tour nổi bật
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                      <Clock className="h-3.5 w-3.5 text-orange-400" />
                      {tour.duration}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="mb-3 line-clamp-2 font-display text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                    {tour.title}
                  </h3>

                  <div className="mb-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-50">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <span className="font-medium">Khởi hành:</span>
                      <span className="text-gray-900">{tour.departureLoc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-50">
                        <MapPin className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <span className="font-medium">Điểm đến:</span>
                      <span className="text-gray-900">{tour.destinationLoc.name}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-dashed border-gray-200 pt-6">
                    <div>
                      <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Giá từ
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-orange-600">
                          {tour.minPrice ? formatPrice(tour.minPrice) : 'Liên hệ'}
                        </span>
                        <span className="text-xs font-bold text-gray-400">₫</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="btn-ghost group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-gray-700"
          >
            XEM TẤT CẢ TOUR
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
