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

interface ShowsSectionProps {
  locationFilter?: string;
}

export function ShowsSection({ locationFilter }: ShowsSectionProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true);
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/shows`);
        if (locationFilter) {
          url.searchParams.set('location', locationFilter);
        }
        url.searchParams.set('limit', '6');
        url.searchParams.set('status', 'UPCOMING');

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.data && Array.isArray(data.data)) {
          setShows(data.data);
        } else if (Array.isArray(data)) {
          setShows(data);
        }
      } catch (error) {
        console.error('Failed to fetch shows:', error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
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
            <p className="mt-2 text-gray-600">
              Khám phá những show âm nhạc độc đáo tại các địa điểm đẹp nhất
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm show..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors shadow-sm"
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
            <p className="text-gray-500 text-lg">
              Không tìm thấy show nào phù hợp
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-gray-700 font-medium group"
          >
            XEM TẤT CẢ SHOW
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
