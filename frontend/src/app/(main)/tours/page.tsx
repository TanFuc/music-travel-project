'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  ArrowRight,
  PlaneTakeoff,
  PlaneLanding,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { locationService } from '@/services/location.service';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface Tour {
  id: number;
  title: string;
  slug: string;
  duration: string;
  departureLoc: { name: string; slug: string } | null;
  destinationLoc: { name: string; slug: string } | null;
  branch: { id: number; name: string } | null;
  minPrice: number | null;
  thumbnailUrl?: string;
  nextSchedule: {
    id: number;
    startDate: string;
    price: number;
  } | null;
}

interface ToursResponse {
  items: Tour[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [page, setPage] = useState(1);
  const locationSlug = searchParams.get('location') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const departureSlug = searchParams.get('departure') || 'all';
  const destinationSlug = searchParams.get('destination') || 'all';
  
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
    queryKey: ['tours', page, locationSlug, searchTerm, departureSlug, destinationSlug],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (locationSlug !== 'all') params.append('location', locationSlug);
      if (departureSlug !== 'all') params.append('departure', departureSlug);
      if (destinationSlug !== 'all') params.append('destination', destinationSlug);
      if (searchTerm) params.append('search', searchTerm);
      const response = await get<ToursResponse>(`/tours?${params.toString()}`);
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
          <p className="text-red-600 font-medium mb-4">Không thể tải danh sách tour. Vui lòng thử lại sau.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-brand-50 text-brand-700 hover:bg-brand-50 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Khám phá Việt Nam
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Hành Trình <span className="text-brand-600">Âm Nhạc</span> <br /> & Khám Phá
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
              Những chuyến đi đầy cảm hứng, kết hợp giữa vẻ đẹp thiên nhiên và những giai điệu tuyệt vời nhất.
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
                    placeholder="Bạn muốn đi đâu?"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="pl-12 h-14 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-base"
                  />
                </div>

                <div className="hidden md:block w-px h-8 bg-gray-100" />

                {/* Departure Dropdown */}
                <div className="flex-1 w-full group">
                  <div className="px-4 flex flex-col">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">Điểm đi</label>
                    <Select value={departureSlug} onValueChange={(val) => updateFilters({ departure: val })}>
                      <SelectTrigger className="h-8 border-none bg-transparent p-1 focus:ring-0 text-base font-medium">
                        <div className="flex items-center gap-2">
                          <PlaneTakeoff className="w-4 h-4 text-brand-500" />
                          <SelectValue placeholder="Tất cả" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">Tất cả điểm đi</SelectItem>
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.slug}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="hidden md:block">
                  <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                </div>

                {/* Destination Dropdown */}
                <div className="flex-1 w-full group">
                  <div className="px-4 flex flex-col">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">Điểm đến</label>
                    <Select value={destinationSlug} onValueChange={(val) => updateFilters({ destination: val })}>
                      <SelectTrigger className="h-8 border-none bg-transparent p-1 focus:ring-0 text-base font-medium">
                        <div className="flex items-center gap-2">
                          <PlaneLanding className="w-4 h-4 text-brand-500" />
                          <SelectValue placeholder="Tất cả" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">Tất cả điểm đến</SelectItem>
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
                  Tìm ngay
                </Button>
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex items-center gap-4 mt-6 ml-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Gợi ý:</span>
              {['Đà Lạt', 'Phú Quốc', 'Ninh Bình', 'Đà Nẵng'].map((city) => (
                <button 
                  key={city}
                  onClick={() => {
                    const slug = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/ /g, '-');
                    updateFilters({ destination: slug });
                  }}
                  className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-colors whitespace-nowrap"
                >
                  {city}
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
              {(searchTerm || departureSlug !== 'all' || destinationSlug !== 'all') && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Tìm thấy <b className="text-gray-900">{data?.meta?.total || 0}</b> chuyến đi phù hợp</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-brand-600 hover:text-brand-700 hover:bg-brand-50">
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.items?.map((tour, idx) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/tours/${tour.slug}`} className="group block h-full">
                      <div className="glass-card-premium h-full flex flex-col group-hover:border-brand-500/20">
                        {/* Image Header */}
                        <div className="relative h-64 overflow-hidden">
                          <Image 
                            src={tour.thumbnailUrl || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80`}
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
                                    {tour.departureLoc?.name} <ArrowRight className="inline w-3 h-3 mx-1" /> {tour.destinationLoc.name}
                                  </span>
                                </div>
                              )}
                              
                              {tour.nextSchedule && (
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <div className="p-1.5 rounded-lg bg-gray-50">
                                    <Calendar className="w-4 h-4 text-brand-500" />
                                  </div>
                                  <span className="font-medium">Khởi hành: {formatDate(tour.nextSchedule.startDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                            <div>
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Giá từ</span>
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
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {data?.items?.length === 0 && (
                <div className="text-center py-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chuyến đi</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Chúng tôi không tìm thấy tour nào phù hợp với yêu cầu của bạn. Hãy thử thay đổi bộ lọc.</p>
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
