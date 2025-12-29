'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Music } from 'lucide-react';

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

// Mock data
const mockStages: Stage[] = [
  {
    id: 1,
    name: 'Thung Lũng Mây',
    address: 'Đường Khe Sanh, Đà Lạt',
    location: { name: 'Đà Lạt', slug: 'da-lat' },
    activeShowCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: 2,
    name: 'Mây In The Nest',
    address: 'Hẻm 42, Đà Lạt',
    location: { name: 'Đà Lạt', slug: 'da-lat' },
    activeShowCount: 3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 189,
  },
  {
    id: 3,
    name: 'Sky Garden',
    address: 'Quận 1, TP.HCM',
    location: { name: 'Sài Gòn', slug: 'sai-gon' },
    activeShowCount: 8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 312,
  },
  {
    id: 4,
    name: 'The Nest Hanoi',
    address: 'Tây Hồ, Hà Nội',
    location: { name: 'Hà Nội', slug: 'ha-noi' },
    activeShowCount: 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 156,
  },
];

export function StagesSection() {
  const [stages, setStages] = useState<Stage[]>(mockStages);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/stages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStages(data.slice(0, 4));
        }
      })
      .catch(() => {
        // Use mock data
      });
  }, []);

  return (
    <section className="py-16 bg-dark-deeper/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h2 className="section-title flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            CÁC SÂN KHẤU
          </h2>
          <p className="mt-2 text-white/60">
            Khám phá những địa điểm biểu diễn độc đáo trên khắp Việt Nam
          </p>
        </div>

        {/* Grid */}
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

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />

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
                        <span className="text-white/50 text-sm">
                          ({stage.reviewCount} đánh giá)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-brand-400">
                      <Music className="w-4 h-4" />
                      <span className="font-medium">{stage.activeShowCount} show</span>
                      <span className="text-white/50 text-sm">đang mở bán</span>
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
      </div>
    </section>
  );
}
