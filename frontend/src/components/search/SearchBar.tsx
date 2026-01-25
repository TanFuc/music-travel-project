'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, MapPin, Calendar, Music, Compass, ChevronDown } from 'lucide-react';
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
import { searchService, SearchType, SearchResults } from '@/services/search.service';
import { branchService } from '@/services/branch.service';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Link } from '@/components/common/Link';

interface SearchBarProps {
  className?: string;
  showFilters?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

export function SearchBar({ className, showFilters = true, onClose, isExpanded = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchType>('all');
  const [branchId, setBranchId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Click outside to close
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

  // Fetch branches for filter
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
    staleTime: 10 * 60 * 1000,
  });

  // Debounced search
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, type, branchId],
    queryFn: () =>
      searchService.search({
        q: query,
        type,
        branchId: branchId ? Number(branchId) : undefined,
        limit: 5,
      }),
    enabled: query.length >= 2,
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
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
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
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm show, tour, địa điểm..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500/20"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button - Mobile */}
          {showFilters && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden h-11 w-11 border-gray-200"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className={cn('w-5 h-5', showFilterPanel && 'text-brand-500')} />
            </Button>
          )}

          {/* Desktop Filters */}
          {showFilters && (
            <div className="hidden md:flex items-center gap-2">
              <Select value={type} onValueChange={(val) => setType(val as SearchType)}>
                <SelectTrigger className="w-32 h-11 border-gray-200">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="shows">Shows</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="locations">Địa điểm</SelectItem>
                </SelectContent>
              </Select>

              <Select value={branchId || '__all__'} onValueChange={(val) => setBranchId(val === '__all__' ? '' : val)}>
                <SelectTrigger className="w-40 h-11 border-gray-200">
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

          {/* Search Button */}
          <Button type="submit" className="h-11 px-6 btn-primary">
            <Search className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Tìm kiếm</span>
          </Button>

          {/* Close button for modal */}
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-11 w-11"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Mobile Filter Panel */}
        {showFilters && showFilterPanel && (
          <div className="md:hidden mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-lg space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Loại</label>
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
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Chi nhánh</label>
              <Select value={branchId || '__all__'} onValueChange={(val) => setBranchId(val === '__all__' ? '' : val)}>
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

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
              Đang tìm kiếm...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy kết quả cho "{query}"
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Shows Results */}
              {results?.shows.items.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Music className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Shows</span>
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
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{show.title}</p>
                          <p className="text-xs text-gray-500 truncate">
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

              {/* Tours Results */}
              {results?.tours.items.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Compass className="w-4 h-4 text-accent-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Tours</span>
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
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                          <Compass className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{tour.title}</p>
                          <p className="text-xs text-gray-500 truncate">
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

              {/* Locations Results */}
              {results?.locations.items.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <MapPin className="w-4 h-4 text-success-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Địa điểm</span>
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
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{location.name}</p>
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

              {/* View All Link */}
              {hasResults && (
                <div className="p-3">
                  <Button
                    variant="ghost"
                    className="w-full text-brand-600 hover:text-brand-700 hover:bg-brand-50"
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
