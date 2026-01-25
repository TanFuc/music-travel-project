'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import {
  Search,
  Music,
  Compass,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchBar } from '@/components/search/SearchBar';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { searchService, SearchType } from '@/services/search.service';
import { branchService } from '@/services/branch.service';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  UPCOMING: 'success',
  ONGOING: 'warning',
  ENDED: 'secondary',
  CANCELLED: 'destructive',
};

const statusLabels: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchType) || 'all';
  const initialBranchId = searchParams.get('branchId') || '';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);
  const [branchId, setBranchId] = useState(initialBranchId);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, type, branchId]);

  // Update state when URL params change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setType((searchParams.get('type') as SearchType) || 'all');
    setBranchId(searchParams.get('branchId') || '');
  }, [searchParams]);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['search-results', query, type, branchId, page],
    queryFn: () =>
      searchService.search({
        q: query,
        type,
        branchId: branchId ? Number(branchId) : undefined,
        page,
        limit,
      }),
    enabled: query.length > 0,
    staleTime: 30 * 1000,
  });

  const totalResults =
    (results?.shows.total || 0) +
    (results?.tours.total || 0) +
    (results?.locations.total || 0);

  const getCurrentTotal = () => {
    if (type === 'shows') return results?.shows.total || 0;
    if (type === 'tours') return results?.tours.total || 0;
    if (type === 'locations') return results?.locations.total || 0;
    return totalResults;
  };

  const totalPages = Math.ceil(getCurrentTotal() / limit);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Search Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4">
          Tìm kiếm
        </h1>
        <SearchBar showFilters={false} className="max-w-2xl" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            variant={type === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('all')}
            className={cn(type === 'all' && 'btn-primary')}
          >
            Tất cả
            {results && (
              <Badge variant="secondary" className="ml-2">
                {totalResults}
              </Badge>
            )}
          </Button>
          <Button
            variant={type === 'shows' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('shows')}
            className={cn(type === 'shows' && 'btn-primary')}
          >
            <Music className="w-4 h-4 mr-1.5" />
            Shows
            {results && (
              <Badge variant="secondary" className="ml-2">
                {results.shows.total}
              </Badge>
            )}
          </Button>
          <Button
            variant={type === 'tours' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('tours')}
            className={cn(type === 'tours' && 'btn-primary')}
          >
            <Compass className="w-4 h-4 mr-1.5" />
            Tours
            {results && (
              <Badge variant="secondary" className="ml-2">
                {results.tours.total}
              </Badge>
            )}
          </Button>
          <Button
            variant={type === 'locations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('locations')}
            className={cn(type === 'locations' && 'btn-primary')}
          >
            <MapPin className="w-4 h-4 mr-1.5" />
            Địa điểm
            {results && (
              <Badge variant="secondary" className="ml-2">
                {results.locations.total}
              </Badge>
            )}
          </Button>
        </div>

        <div className="sm:ml-auto">
          <Select value={branchId || '__all__'} onValueChange={(val) => setBranchId(val === '__all__' ? '' : val)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tất cả chi nhánh" />
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

      {/* Results Info */}
      {query && !isLoading && results && (
        <p className="text-gray-600 mb-6">
          Tìm thấy <span className="font-semibold text-gray-900">{getCurrentTotal()}</span> kết quả
          cho "<span className="font-semibold text-brand-600">{query}</span>"
        </p>
      )}

      {/* No Query State */}
      {!query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Nhập từ khóa để tìm kiếm
          </h2>
          <p className="text-gray-500">
            Tìm kiếm show, tour du lịch hoặc địa điểm bạn quan tâm
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && query && results && (
        <div className="space-y-8">
          {/* Shows Results */}
          {(type === 'all' || type === 'shows') && results.shows.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-brand-500" />
                  Shows ({results.shows.total})
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {results.shows.items.map((show) => (
                  <Card key={show.id} className="card-hover overflow-hidden">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                      <span className="text-white text-lg sm:text-xl font-display font-bold text-center px-4">
                        {show.title}
                      </span>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold line-clamp-1">{show.title}</h3>
                        <Badge variant={statusColors[show.status]}>
                          {statusLabels[show.status]}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <span className="truncate">{formatDateTime(show.performTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <span className="truncate">
                            {show.stage.name}, {show.stage.location.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          {show.minPrice && (
                            <p className="text-lg font-bold text-brand-600">
                              {formatCurrency(show.minPrice)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Còn {show.availableTickets} vé
                          </p>
                        </div>
                        <Link href={`/shows/${show.slug}`}>
                          <Button size="sm">Xem chi tiết</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tours Results */}
          {(type === 'all' || type === 'tours') && results.tours.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-accent-500" />
                  Tours ({results.tours.total})
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {results.tours.items.map((tour) => (
                  <Card key={tour.id} className="card-hover overflow-hidden">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                      <span className="text-white text-lg sm:text-xl font-display font-bold text-center px-4">
                        {tour.title}
                      </span>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold line-clamp-2">{tour.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {tour.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent-500 flex-shrink-0" />
                            <span>{tour.duration}</span>
                          </div>
                        )}
                        {tour.destinationLoc && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-accent-500 flex-shrink-0" />
                            <span className="truncate">
                              {tour.departureLoc?.name} → {tour.destinationLoc.name}
                            </span>
                          </div>
                        )}
                        {tour.nextSchedule && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-accent-500 flex-shrink-0" />
                            <span>Khởi hành: {formatDate(tour.nextSchedule.startDate)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          {tour.minPrice && (
                            <p className="text-lg font-bold text-accent-600">
                              {formatCurrency(tour.minPrice)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">/ người</p>
                        </div>
                        <Link href={`/tours/${tour.slug}`}>
                          <Button size="sm" variant="outline">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locations Results */}
          {(type === 'all' || type === 'locations') && results.locations.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-success-500" />
                  Địa điểm ({results.locations.total})
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.locations.items.map((location) => (
                  <Link
                    key={location.id}
                    href={`/shows?location=${location.slug}`}
                    className="block"
                  >
                    <Card className="card-hover h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {location.name}
                            </h3>
                            {location.showCount > 0 && (
                              <Badge variant="outline" className="mt-2">
                                {location.showCount} shows
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {totalResults === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Không tìm thấy kết quả
              </h2>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Trước</span>
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <span className="hidden sm:inline mr-1">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
