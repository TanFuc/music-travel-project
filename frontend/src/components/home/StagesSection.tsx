'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Users, ArrowRight, Loader2, Star, Music } from 'lucide-react';
import { get } from '@/lib/api';

interface HomeStage {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  location?: string | { name: string };
}

export function StagesSection() {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['home-stages'],
    queryFn: () => get<HomeStage[]>('/home-stages?activeOnly=true'),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-12 md:py-16 bg-brand-50/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-brand-100/50 text-2xl animate-bounce-slow">
              🏛️
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-4 tracking-tight">
              CÁC SÂN KHẤU <span className="text-brand-600">NỔI BẬT</span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
               Khám phá những không gian âm nhạc đẳng cấp, nơi những giai điệu thăng hoa giữa thiên nhiên hùng vĩ và kiến trúc độc đáo.
            </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : stages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có sân khấu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl hover:shadow-brand-500/20 transition-all duration-500 bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                   <Image
                      src={stage.imageUrl}
                      alt={stage.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                   
                   {/* Content Overlay */}
                   <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {/* Location Badge */}
                          {stage.location && (
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white mb-3">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-wider">
                                   {typeof stage.location === 'string' ? stage.location : stage.location.name}
                                </span>
                             </div>
                          )}
                          
                          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight">
                             {stage.title}
                          </h3>
                          
                          <p className="text-white/80 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                             {stage.description || 'Một không gian tuyệt vời để thưởng thức âm nhạc và nghệ thuật.'}
                          </p>

                          <div className="flex items-center gap-2 text-brand-300 text-sm font-bold uppercase tracking-wider group/link">
                             Xem chi tiết
                             <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
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
