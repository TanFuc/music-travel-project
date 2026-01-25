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
  location?: string;
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
                className="group relative overflow-hidden rounded-2xl glass-card animate-fadeIn opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={stage.imageUrl}
                    alt={stage.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="font-display font-bold text-2xl text-white mb-2">
                      {stage.title}
                    </h3>

                    {stage.location && (
                      <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                        <MapPin className="w-4 h-4 text-brand-400" />
                        <span>{stage.location}</span>
                      </div>
                    )}

                    {stage.description && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {stage.description}
                      </p>
                    )}
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
