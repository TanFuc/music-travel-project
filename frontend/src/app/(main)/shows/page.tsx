'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Music, 
  Mic2, 
  Ticket, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShowCard } from '@/components/shows/ShowCard';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { locationService } from '@/services/location.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  performTime: string;
  status: string;
  createdAt: string;
  branch: { id: number; name: string } | null;
  stage: {
    id: number;
    name: string;
    location: {
      id: number;
      name: string;
      latitude?: number;
      longitude?: number;
    };
  };
  artists: Array<{
    id: number;
    name: string;
    isHeadline: boolean;
  }>;
  ticketClasses: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  availableTickets: number;
  minPrice: number | null;
  thumbnailUrl?: string;
}

interface ShowsResponse {
  items: Show[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ShowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [page, setPage] = useState(1);
  const locationSlug = searchParams.get('location') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchTerm);
  const limit = 12;

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getLocations(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['shows', page, locationSlug, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (locationSlug !== 'all') params.append('location', locationSlug);
      if (searchTerm) params.append('search', searchTerm);

      const response = await get<ShowsResponse>(`/shows?${params.toString()}`);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push(pathname);
    setPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium mb-4">Không thể tải danh sách sự kiện. Vui lòng thử lại sau.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-brand-50 text-brand-700 hover:bg-brand-50 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Lịch Diễn Live Music
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Sống Với <span className="text-brand-600">Giai Điệu</span> <br /> & Tình Yêu
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
              Những đêm nhạc đầy cảm xúc tại các sân khấu tuyệt vời nhất Việt Nam.
            </p>
          </motion.div>

          {/* Premium Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-5xl"
          >
            <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-gray-200/60 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-2">
                
                {/* Search Text */}
                <div className="flex-1 w-full relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input 
                    placeholder="Tìm nghệ sĩ, đêm nhạc..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="pl-12 h-14 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-base font-medium"
                  />
                </div>

                <div className="hidden md:block w-px h-8 bg-gray-100" />

                {/* Location Filter */}
                <div className="flex-1 w-full group">
                  <div className="px-4 flex flex-col">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">Địa điểm</label>
                    <Select value={locationSlug} onValueChange={(val) => updateFilters({ location: val })}>
                      <SelectTrigger className="h-8 border-none bg-transparent p-1 focus:ring-0 text-base font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-500" />
                          <SelectValue placeholder="Tất cả chi nhánh" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.slug}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSearch}
                  className="w-full md:w-auto h-14 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-brand-600/30"
                >
                  Tìm show
                </Button>
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex items-center gap-4 mt-6 ml-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Gợi ý:</span>
              {['Lululola', 'Mây Lang Thang', 'Live Band', 'Acoustic'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => {
                    setSearchInput(tag);
                    updateFilters({ search: tag });
                  }}
                  className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-colors whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ShowCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {/* Header Info */}
              {(searchTerm || locationSlug !== 'all') && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Tìm thấy <b className="text-gray-900">{data?.meta?.total || 0}</b> sự kiện phù hợp</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-brand-600 hover:text-brand-700 hover:bg-brand-50">
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.items?.map((show, idx) => (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ShowCard
                      {...show}
                      stage={{
                        ...show.stage,
                        location: typeof show.stage.location === 'string'
                          ? { name: show.stage.location }
                          : show.stage.location
                      }}
                      badges={(() => {
                        const badges: any[] = [];
                        if (show.availableTickets < 50 && show.availableTickets > 0) badges.push('HOT');
                        if (show.availableTickets === 0) badges.push('SOLD_OUT');
                        // Mock NEW for recent items
                        if (idx < 2 && page === 1) badges.push('NEW');
                        return badges;
                      })()}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {data?.items?.length === 0 && (
                <div className="text-center py-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                    <Music className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có lịch diễn</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Vui lòng quay lại sau hoặc thử thay đổi điều kiện tìm kiếm.</p>
                  <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8">Xóa bộ lọc</Button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Pagination - Premium Style */}
        {data && data.meta && data.meta.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(data.meta.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
                      : 'bg-white text-gray-400 border border-gray-100 hover:border-brand-500/30 hover:text-brand-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all"
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages || isLoading}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
