'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Users, ArrowRight, Loader2, Star, Music } from 'lucide-react';
import { get } from '@/lib/api';

interface Stage {
  id: number;
  name: string;
  address?: string;
  location: {
    name: string;
    slug: string;
  };
  activeShowCount: number;
  thumbnailUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export function StagesSection() {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['home-stages'],
    queryFn: async () => {
      const response = await get<{ items: Stage[]; meta: unknown }>('/stages?limit=4');
      return (response.items || []).slice(0, 4);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
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
              <Link
                key={stage.id}
                href={`/stages/${stage.id}`}
                className="group relative overflow-hidden rounded-2xl glass-card card-hover animate-fadeIn opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={stage.thumbnailUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'}
                    alt={stage.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay - Bright green */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-800/80 via-brand-700/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="font-display font-bold text-2xl text-white mb-2 group-hover:text-brand-400 transition-colors">
                      {stage.name}
                    </h3>

                    <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      <span>{stage.location.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {stage.rating && (
                        <div className="flex items-center gap-1 text-gold-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{stage.rating}</span>
                          <span className="text-white/70 text-sm">
                            ({stage.reviewCount} đánh giá)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-brand-400">
                        <Music className="w-4 h-4" />
                        <span className="font-medium">{stage.activeShowCount} show</span>
                        <span className="text-white/70 text-sm">đang mở bán</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white text-sm font-medium group-hover:bg-brand-500 transition-colors">
                        Xem show tại đây
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
