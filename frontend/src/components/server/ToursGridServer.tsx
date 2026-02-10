/**
 * Server Component: ToursGridServer
 * Renders the tours grid with data passed from the server
 */

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
  departureLoc: { name: string; slug?: string } | null;
  destinationLoc: { name: string; slug?: string } | null;
  branch: { id: number; name: string } | null;
  minPrice: number | null;
  thumbnailUrl?: string;
  nextSchedule: {
    id: number;
    startDate: string;
    price: number;
  } | null;
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
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
          <Search className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Chúng tôi không tìm thấy tour nào phù hợp với yêu cầu của bạn. Hãy thử thay đổi bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tours.map((tour, idx) => (
        <article
          key={tour.id}
          className="animate-fadeIn opacity-0"
          style={{
            animationDelay: `${idx * 0.05}s`,
            animationFillMode: 'forwards',
          }}
        >
          <Link href={`/tours/${tour.slug}`} className="group block h-full">
            <div className="glass-card-premium h-full flex flex-col group-hover:border-brand-500/20">
              {/* Image Header */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges on Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {tour.duration && (
                    <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-none px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-brand-600" />
                      {tour.duration}
                    </Badge>
                  )}
                </div>

                {tour.branch && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-brand-600 text-white border-none px-3 py-1 text-[10px] font-bold shadow-lg shadow-brand-600/20 uppercase tracking-tighter">
                      {tour.branch.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-6 flex-1 flex flex-col bg-white">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {tour.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    {tour.destinationLoc && (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="p-1.5 rounded-lg bg-gray-50">
                          <MapPin className="w-4 h-4 text-brand-500" />
                        </div>
                        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {tour.departureLoc?.name}{' '}
                          <ArrowRight className="inline w-3 h-3 mx-1" />{' '}
                          {tour.destinationLoc.name}
                        </span>
                      </div>
                    )}

                    {tour.nextSchedule && (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="p-1.5 rounded-lg bg-gray-50">
                          <Calendar className="w-4 h-4 text-brand-500" />
                        </div>
                        <span className="font-medium">
                          Khởi hành: {formatDate(tour.nextSchedule.startDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Giá từ
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-brand-600">
                        {tour.minPrice ? formatCurrency(tour.minPrice) : 'Liên hệ'}
                      </span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
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
