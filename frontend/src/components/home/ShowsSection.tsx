'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { ShowCard } from '@/components/shows/ShowCard';

interface Show {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  performTime: string;
  stage: {
    name: string;
    location: { name: string };
  };
  minPrice: number | null;
  availableTickets: number;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
}

// Mock data for development
const mockShows: Show[] = [
  {
    id: 1,
    title: 'Đêm Nhạc Trịnh - Thung Lũng Mây',
    slug: 'dem-nhac-trinh-thung-lung-may',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=600&fit=crop',
    performTime: '2025-01-15T20:00:00',
    stage: { name: 'Thung Lũng Mây', location: { name: 'Đà Lạt' } },
    minPrice: 350000,
    availableTickets: 45,
    badges: ['HOT', 'VIP'],
  },
  {
    id: 2,
    title: 'Acoustic Night - Mây In The Nest',
    slug: 'acoustic-night-may-in-the-nest',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    performTime: '2025-01-20T19:30:00',
    stage: { name: 'Mây In The Nest', location: { name: 'Đà Lạt' } },
    minPrice: 299000,
    availableTickets: 12,
    badges: ['NEW'],
  },
  {
    id: 3,
    title: 'Jazz Under The Stars',
    slug: 'jazz-under-the-stars',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    performTime: '2025-01-25T21:00:00',
    stage: { name: 'Sky Garden', location: { name: 'Sài Gòn' } },
    minPrice: 450000,
    availableTickets: 78,
    badges: ['VIP'],
  },
  {
    id: 4,
    title: 'Indie Night - Những Câu Chuyện Nhỏ',
    slug: 'indie-night-nhung-cau-chuyen-nho',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=600&fit=crop',
    performTime: '2025-02-01T20:00:00',
    stage: { name: 'The Nest', location: { name: 'Hà Nội' } },
    minPrice: 280000,
    availableTickets: 5,
    badges: ['SOON'],
  },
  {
    id: 5,
    title: 'Folk & Soul Night',
    slug: 'folk-soul-night',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=600&fit=crop',
    performTime: '2025-02-10T19:00:00',
    stage: { name: 'Garden Stage', location: { name: 'Đà Nẵng' } },
    minPrice: 320000,
    availableTickets: 0,
    badges: ['SOLD_OUT'],
  },
  {
    id: 6,
    title: 'Moonlight Serenade',
    slug: 'moonlight-serenade',
    thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop',
    performTime: '2025-02-14T20:30:00',
    stage: { name: 'Thung Lũng Mây', location: { name: 'Đà Lạt' } },
    minPrice: 500000,
    availableTickets: 32,
    badges: ['HOT', 'VIP'],
  },
];

interface ShowsSectionProps {
  locationFilter?: string;
}

export function ShowsSection({ locationFilter }: ShowsSectionProps) {
  const [shows, setShows] = useState<Show[]>(mockShows);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Fetch shows from API
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/shows`);
    if (locationFilter) {
      url.searchParams.set('location', locationFilter);
    }
    url.searchParams.set('limit', '6');
    url.searchParams.set('status', 'UPCOMING');

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setShows(data.data);
        }
      })
      .catch(() => {
        // Use mock data on error
        setShows(mockShows);
      })
      .finally(() => setIsLoading(false));
  }, [locationFilter]);

  const filteredShows = searchQuery
    ? shows.filter((show) =>
        show.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shows;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title flex items-center gap-3">
              <span className="text-3xl">🎵</span>
              SHOW ĐANG MỞ BÁN
            </h2>
            <p className="mt-2 text-white/60">
              Khám phá những show âm nhạc độc đáo tại các địa điểm đẹp nhất
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Tìm kiếm show..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="aspect-[3/4] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                  <div className="h-4 w-2/3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map((show, index) => (
              <div
                key={show.id}
                className="animate-fadeIn opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <ShowCard {...show} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">
              Không tìm thấy show nào phù hợp
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-white font-medium group"
          >
            XEM TẤT CẢ SHOW
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
