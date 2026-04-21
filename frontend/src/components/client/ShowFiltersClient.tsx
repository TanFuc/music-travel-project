'use client';
import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, X, Sparkles } from 'lucide-react';
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
interface ShowFiltersClientProps {
  locations: Location[];
  total?: number;
}
export function ShowFiltersClient({ locations, total }: ShowFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const locationSlug = searchParams.get('location') || 'all';
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
  const hasFilters = searchTerm || locationSlug !== 'all';
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-5xl"
      >
        <div className="rounded-[2rem] border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/60">
          <form onSubmit={handleSearch} className="flex flex-col items-center gap-2 md:flex-row">
            <div className="relative w-full flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="Tìm nghệ sĩ, đêm nhạc..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-14 border-none bg-transparent pl-12 text-base font-medium text-gray-900 placeholder:text-gray-400 focus-visible:ring-0"
              />
            </div>

            <div className="hidden h-8 w-px bg-gray-100 md:block" />

            <div className="group w-full flex-1">
              <div className="flex flex-col px-4">
                <label className="mb-0.5 px-1 text-[10px] font-bold uppercase text-gray-400">
                  Địa điểm
                </label>
                <Select
                  value={locationSlug}
                  onValueChange={(val) => updateFilters({ location: val })}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent p-1 text-base font-medium focus:ring-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      <SelectValue placeholder="Tất cả chi nhánh" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
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
              className="h-14 w-full rounded-2xl bg-brand-600 px-8 font-bold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 md:w-auto"
            >
              {isPending ? 'Đang tìm...' : 'Tìm show'}
            </Button>
          </form>
        </div>

        <div className="scrollbar-hide ml-4 mt-6 flex items-center gap-4 overflow-x-auto pb-2">
          <span className="whitespace-nowrap text-xs font-bold uppercase text-gray-400">
            Gợi ý:
          </span>
          {['Lululola', 'Mây Lang Thang', 'Live Band', 'Acoustic'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchInput(tag);
                updateFilters({ search: tag });
              }}
              className="whitespace-nowrap rounded-full border border-gray-100 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span>
              Tìm thấy <b className="text-gray-900">{total || 0}</b> sự kiện phù hợp
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-brand-600 hover:bg-brand-50 hover:text-brand-700"
          >
            <X className="mr-1 h-4 w-4" />
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
