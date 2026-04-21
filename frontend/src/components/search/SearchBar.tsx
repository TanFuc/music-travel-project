'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, MapPin, Music, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { searchService, SearchType } from '@/services/search.service';
import { branchService } from '@/services/branch.service';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Link } from '@/components/common/Link';
import { useDebounce } from '@/hooks/usePerformance';
interface SearchBarProps {
  className?: string;
  showFilters?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}
export function SearchBar({
  className,
  showFilters = true,
  onClose,
  isExpanded = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<SearchType>('all');
  const [branchId, setBranchId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilterPanel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const debouncedSetQuery = useDebounce((value: string) => {
    setDebouncedQuery(value);
  }, 300);
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, type, branchId],
    queryFn: () =>
      searchService.search({
        q: debouncedQuery,
        type,
        branchId: branchId ? Number(branchId) : undefined,
        limit: 5,
      }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        const params = new URLSearchParams();
        params.append('q', query);
        if (type !== 'all') params.append('type', type);
        if (branchId) params.append('branchId', branchId);
        router.push(`/search?${params.toString()}`);
        setShowResults(false);
        onClose?.();
      }
    },
    [query, type, branchId, router, onClose]
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSetQuery(value);
    if (value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  };
  const hasResults =
    results &&
    (results.shows.items.length > 0 ||
      results.tours.items.length > 0 ||
      results.locations.items.length > 0);
  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm show, tour, địa điểm..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              className="h-11 border-gray-200 bg-white pl-10 pr-10 focus:border-brand-500 focus:ring-brand-500/20"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showFilters && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 border-gray-200 md:hidden"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className={cn('h-5 w-5', showFilterPanel && 'text-brand-500')} />
            </Button>
          )}

          {showFilters && (
            <div className="hidden items-center gap-2 md:flex">
              <Select value={type} onValueChange={(val) => setType(val as SearchType)}>
                <SelectTrigger className="h-11 w-32 border-gray-200">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="shows">Shows</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="locations">Địa điểm</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={branchId || '__all__'}
                onValueChange={(val) => setBranchId(val === '__all__' ? '' : val)}
              >
                <SelectTrigger className="h-11 w-40 border-gray-200">
                  <SelectValue placeholder="Chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="btn-primary h-11 px-6">
            <Search className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Tìm kiếm</span>
          </Button>

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-11 w-11"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {showFilters && showFilterPanel && (
          <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:hidden">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại</label>
              <Select value={type} onValueChange={(val) => setType(val as SearchType)}>
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="shows">Shows</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="locations">Địa điểm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Chi nhánh</label>
              <Select
                value={branchId || '__all__'}
                onValueChange={(val) => setBranchId(val === '__all__' ? '' : val)}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả chi nhánh</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </form>

      {showResults && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              Đang tìm kiếm...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy kết quả cho "{query}"
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results?.shows.items.length > 0 && (
                <div className="p-3">
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <Music className="h-4 w-4 text-brand-500" />
                    <span className="text-xs font-semibold uppercase text-gray-500">Shows</span>
                    <Badge variant="secondary" className="text-xs">
                      {results.shows.total}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {results.shows.items.map((show) => (
                      <Link
                        key={show.id}
                        href={`/shows/${show.slug}`}
                        onClick={() => {
                          setShowResults(false);
                          onClose?.();
                        }}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">{show.title}</p>
                          <p className="truncate text-xs text-gray-500">
                            {show.stage.name} • {formatDateTime(show.performTime)}
                          </p>
                        </div>
                        {show.minPrice && (
                          <span className="text-sm font-semibold text-brand-600">
                            {formatCurrency(show.minPrice)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.tours.items.length > 0 && (
                <div className="p-3">
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <Compass className="h-4 w-4 text-accent-500" />
                    <span className="text-xs font-semibold uppercase text-gray-500">Tours</span>
                    <Badge variant="secondary" className="text-xs">
                      {results.tours.total}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {results.tours.items.map((tour) => (
                      <Link
                        key={tour.id}
                        href={`/tours/${tour.slug}`}
                        onClick={() => {
                          setShowResults(false);
                          onClose?.();
                        }}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600">
                          <Compass className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">{tour.title}</p>
                          <p className="truncate text-xs text-gray-500">
                            {tour.departureLoc?.name} → {tour.destinationLoc?.name}
                            {tour.duration && ` • ${tour.duration}`}
                          </p>
                        </div>
                        {tour.minPrice && (
                          <span className="text-sm font-semibold text-accent-600">
                            {formatCurrency(tour.minPrice)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.locations.items.length > 0 && (
                <div className="p-3">
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <MapPin className="h-4 w-4 text-success-500" />
                    <span className="text-xs font-semibold uppercase text-gray-500">Địa điểm</span>
                    <Badge variant="secondary" className="text-xs">
                      {results.locations.total}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {results.locations.items.map((location) => (
                      <Link
                        key={location.id}
                        href={`/shows?location=${location.slug}`}
                        onClick={() => {
                          setShowResults(false);
                          onClose?.();
                        }}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                      >
                        <div className="from-success-400 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br to-success-600">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">{location.name}</p>
                        </div>
                        {location.showCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {location.showCount} shows
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {hasResults && (
                <div className="p-3">
                  <Button
                    variant="ghost"
                    className="w-full text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                    onClick={() => {
                      handleSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    Xem tất cả kết quả cho "{query}"
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
