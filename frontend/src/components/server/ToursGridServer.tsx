import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { Clock, MapPin, Calendar, ArrowRight, Search } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
interface Tour {
  id: number;
  title: string;
  slug: string;
  duration: string;
  departureLoc: {
    name: string;
  } | null;
  destinationLoc: {
    name: string;
  } | null;
  branch?: {
    id: number;
    name: string;
  } | null;
  minPrice: number | null;
  thumbnailUrl?: string;
  nextSchedule?: {
    id: number;
    startDate: string;
    price: number;
  } | null;
  isCombo?: boolean;
}
interface ToursGridServerProps {
  tours: Tour[];
  emptyMessage?: string;
}
export function ToursGridServer({
  tours,
  emptyMessage = 'Không tìm thấy chuyến đi',
}: ToursGridServerProps) {
  if (!tours || tours.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
          <Search className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{emptyMessage}</h3>
        <p className="mx-auto mb-8 max-w-sm text-gray-500">
          Chúng tôi không tìm thấy tour nào phù hợp với yêu cầu của bạn. Hãy thử thay đổi bộ lọc.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, idx) => (
        <article
          key={tour.id}
          className="animate-fadeIn"
          style={{
            animationDelay: `${idx * 0.05}s`,
          }}
        >
          <Link href={`/tours/${tour.slug}`} className="group block h-full">
            <div className="glass-card-premium flex h-full flex-col group-hover:border-brand-500/20">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={
                    tour.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
                  }
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {tour.duration && (
                    <Badge className="flex items-center gap-1.5 border-none bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-900 backdrop-blur-md">
                      <Clock className="h-3 w-3 text-brand-600" />
                      {tour.duration}
                    </Badge>
                  )}
                </div>

                {tour.branch && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="border-none bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-white shadow-lg shadow-brand-600/20">
                      {tour.branch.name}
                    </Badge>
                  </div>
                )}

                <div className="absolute right-4 top-4">
                  <Badge
                    className={`border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${tour.isCombo ? 'bg-indigo-600' : 'bg-emerald-600'}`}
                  >
                    {tour.isCombo ? 'Eco Combo' : 'Tour'}
                  </Badge>
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col bg-white p-6">
                <div className="flex-1">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                    {tour.title}
                  </h3>

                  <div className="mb-6 space-y-3">
                    {tour.destinationLoc && (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="rounded-lg bg-gray-50 p-1.5">
                          <MapPin className="h-4 w-4 text-brand-500" />
                        </div>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                          {tour.departureLoc?.name} <ArrowRight className="mx-1 inline h-3 w-3" />{' '}
                          {tour.destinationLoc.name}
                        </span>
                      </div>
                    )}

                    {tour.nextSchedule && (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="rounded-lg bg-gray-50 p-1.5">
                          <Calendar className="h-4 w-4 text-brand-500" />
                        </div>
                        <span className="font-medium">
                          Khởi hành:{' '}
                          {tour.nextSchedule?.startDate
                            ? formatDate(tour.nextSchedule.startDate)
                            : 'Chưa có lịch'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-6">
                  <div>
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Giá từ
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-brand-600">
                        {tour.minPrice ? formatCurrency(tour.minPrice) : 'Liên hệ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
