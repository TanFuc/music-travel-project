'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Sparkles, PlaneTakeoff, PlaneLanding, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Location {
  id: number;
  name: string;
  slug: string;
}

interface TourFiltersClientProps {
  locations: Location[];
  total?: number;
}

export function TourFiltersClient({ locations, total }: TourFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const departureSlug = searchParams.get('departure') || 'all';
  const destinationSlug = searchParams.get('destination') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchTerm);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = searchTerm || departureSlug !== 'all' || destinationSlug !== 'all';

  return (
    <div className="space-y-6">
      {/* Premium Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-5xl"
      >
        <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-gray-200/60 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
            {/* Search Text */}
            <div className="flex-1 w-full relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">
                <Search className="w-5 h-5" />
              </div>
              <Input
                placeholder="Bạn muốn đi đâu?"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 h-14 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-base"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-100" />

            {/* Departure Dropdown */}
            <div className="flex-1 w-full group">
              <div className="px-4 flex flex-col">
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">
                  Điểm đi
                </label>
                <Select
                  value={departureSlug}
                  onValueChange={(val) => updateFilters({ departure: val })}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent p-1 focus:ring-0 text-base font-medium">
                    <div className="flex items-center gap-2">
                      <PlaneTakeoff className="w-4 h-4 text-brand-500" />
                      <SelectValue placeholder="Tất cả" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tất cả điểm đi</SelectItem>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.slug}>
                        {loc.name}
                      </SelectItem>
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
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">
                  Điểm đến
                </label>
                <Select
                  value={destinationSlug}
                  onValueChange={(val) => updateFilters({ destination: val, location: val })}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent p-1 focus:ring-0 text-base font-medium">
                    <div className="flex items-center gap-2">
                      <PlaneLanding className="w-4 h-4 text-brand-500" />
                      <SelectValue placeholder="Tất cả" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tất cả điểm đến</SelectItem>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.slug}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto h-14 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-brand-600/30"
            >
              {isPending ? 'Đang tìm...' : 'Tìm ngay'}
            </Button>
          </form>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 mt-6 ml-4 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
            Gợi ý:
          </span>
          {['Đà Lạt', 'Phú Quốc', 'Ninh Bình', 'Đà Nẵng'].map((city) => (
            <button
              key={city}
              onClick={() => {
                const slug = city
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd')
                  .replace(/ /g, '-');
                updateFilters({ destination: slug, location: slug });
              }}
              className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              {city}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filter Results Info */}
      {hasFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>
              Tìm thấy <b className="text-gray-900">{total || 0}</b> chuyến đi phù hợp
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
