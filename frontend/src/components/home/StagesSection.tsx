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
    <section className="py-16 bg-brand-50/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h2 className="section-title flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            CÁC SÂN KHẤU
          </h2>
          <p className="mt-2 text-gray-600">
            Khám phá những địa điểm biểu diễn độc đáo trên khắp Việt Nam
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
                className="group relative overflow-hidden rounded-[2.5rem] glass-card animate-fadeIn opacity-0 border-none shadow-2xl shadow-brand-500/5"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={stage.imageUrl}
                    alt={stage.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />

                  {/* Gradient Overlay - Much lighter and more elegant */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-brand-900/20 to-transparent opacity-70" />

                  {/* Content - Glassy floating effect */}
                  <div className="absolute inset-x-6 bottom-6 p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      <span className="text-[10px] font-black text-brand-200 uppercase tracking-[0.2em]">Sân khấu nổi bật</span>
                    </div>

                    <h3 className="font-display font-black text-2xl text-white mb-2 leading-tight">
                      {stage.title}
                    </h3>

                    <div className="flex items-center justify-between gap-4">
                      {stage.location && (
                        <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                          <MapPin className="w-4 h-4 text-brand-400" />
                          <span>{typeof stage.location === 'string' ? stage.location : stage.location.name}</span>
                        </div>
                      )}

                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                        <ArrowRight className="w-5 h-5" />
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
