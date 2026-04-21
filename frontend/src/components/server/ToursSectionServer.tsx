import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
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
interface ToursSectionServerProps {
  tours: Tour[];
}
function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}
export function ToursSectionServer({ tours }: ToursSectionServerProps) {
  if (!tours || tours.length === 0) {
    return null;
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="animate-bounce-slow mb-4 inline-flex items-center justify-center rounded-2xl bg-orange-100 p-3 text-2xl">
            🌄
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            TOUR DU LỊCH <span className="text-orange-500">KẾT HỢP SHOW</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            Trải nghiệm trọn vẹn: Du lịch khám phá kết hợp thưởng thức show diễn đỉnh cao.
            <span className="ml-1 font-semibold text-orange-600">Combo tiết kiệm đến 30%</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={
                    tour.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
                  }
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute left-4 top-4">
                  <span className="rounded-lg bg-orange-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                    Combo Hot
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
                      Giá trọn gói từ
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
