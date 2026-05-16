'use client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { get } from '@/lib/api';
import { OptimizedImage } from '@/components/common/OptimizedImage';
interface HomeStage {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  location?:
    | string
    | {
        name: string;
      };
}
export function StagesSection() {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['home-stages'],
    queryFn: () => get<HomeStage[]>('/home-stages?activeOnly=true'),
    staleTime: 5 * 60 * 1000,
  });
  return (
    <section className="bg-brand-50/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="animate-bounce-slow mb-4 inline-flex items-center justify-center rounded-2xl bg-brand-100/50 p-3 text-2xl">
            🏛️
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            CÁC SÂN KHẤU <span className="text-brand-600">NỔI BẬT</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            Khám phá những không gian âm nhạc đẳng cấp, nơi những giai điệu thăng hoa giữa thiên
            nhiên hùng vĩ và kiến trúc độc đáo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : stages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">Chưa có sân khấu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="group relative overflow-hidden rounded-[2rem] bg-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <OptimizedImage
                    src={stage.imageUrl}
                    alt={stage.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    quality={80}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    blurPlaceholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23d1d5db' width='800' height='600'/%3E%3C/svg%3E"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <div className="translate-y-4 transform transition-transform duration-500 group-hover:translate-y-0">
                      {stage.location && (
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="uppercase tracking-wider">
                            {typeof stage.location === 'string'
                              ? stage.location
                              : stage.location.name}
                          </span>
                        </div>
                      )}

                      <h3 className="mb-2 font-display text-2xl font-bold leading-tight text-white md:text-3xl">
                        {stage.title}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-white/80 opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100">
                        {stage.description ||
                          'Một không gian tuyệt vời để thưởng thức âm nhạc và nghệ thuật.'}
                      </p>

                      <div className="group/link flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-300">
                        Xem chi tiết
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
