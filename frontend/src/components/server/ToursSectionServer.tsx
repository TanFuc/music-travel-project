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
  } | null;
  destinationLoc: {
    name: string;
  } | null;
  minPrice: number | null;
  nextSchedule?: {
    startDate: string;
    price: number;
    availableSlots: number;
  } | null;
}
interface ToursSectionServerProps {
  tours: Tour[];
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}
function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}
export function ToursSectionServer({
  tours,
  title = 'TOUR DU LỊCH KẾT HỢP SHOW',
  subtitle = 'Trải nghiệm trọn vẹn: Du lịch khám phá kết hợp thưởng thức show diễn đỉnh cao.',
  icon = '🌄',
}: ToursSectionServerProps) {
  if (!tours || tours.length === 0) {
    return null;
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="animate-bounce-slow mb-4 inline-flex items-center justify-center rounded-2xl bg-brand-100 p-3 text-2xl">
            {icon}
          </div>
          <h2 className="mb-4 font-display text-4xl font-black uppercase tracking-tight text-gray-900 md:text-5xl">
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={
                    tour.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
                  }
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute left-4 top-4">
                  <span className="rounded-lg bg-brand-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg ring-1 ring-white/30 backdrop-blur-md">
                    Tour Bán Chạy
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    <Clock className="h-3.5 w-3.5 text-brand-400" />
                    {tour.duration}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="mb-3 line-clamp-2 font-display text-2xl font-black text-gray-900 transition-colors group-hover:text-brand-600">
                  {tour.title}
                </h3>

                <div className="mb-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                      <MapPin className="h-3.5 w-3.5 text-brand-500" />
                    </div>
                    <span className="font-medium">Khởi hành:</span>
                    <span className="text-gray-900">
                      {tour.departureLoc?.name || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                      <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    </div>
                    <span className="font-medium">Điểm đến:</span>
                    <span className="text-gray-900">
                      {tour.destinationLoc?.name || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-dashed border-brand-100 pt-6">
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Giá từ
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-brand-700">
                        {tour.minPrice ? formatPrice(tour.minPrice) : 'Liên hệ'}
                      </span>
                      <span className="text-xs font-bold text-gray-400">₫</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-600/30">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/tours"
            className="btn-ghost group inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest text-brand-700 shadow-xl shadow-brand-900/5 ring-1 ring-brand-100/50 hover:bg-brand-600 hover:text-white"
          >
            KHÁM PHÁ TẤT CẢ TOUR
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
