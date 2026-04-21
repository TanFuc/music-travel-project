'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Link } from '@/components/common/Link';
import {
  Search,
  Music,
  Compass,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchBar } from '@/components/search/SearchBar';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { formatCurrency, formatDateTime, formatDate, cn } from '@/lib/utils';
type SearchType = 'all' | 'shows' | 'tours' | 'locations';
interface Branch {
  id: number;
  name: string;
}
interface ShowResult {
  id: number;
  title: string;
  slug: string;
  status: string;
  performTime: string;
  minPrice: number | null;
  availableTickets: number;
  stage: {
    name: string;
    location: {
      name: string;
    };
  };
}
interface TourResult {
  id: number;
  title: string;
  slug: string;
  duration: string | null;
  minPrice: number | null;
  departureLoc: {
    name: string;
  } | null;
  destinationLoc: {
    name: string;
  } | null;
  nextSchedule: {
    startDate: string;
  } | null;
}
interface LocationResult {
  id: number;
  name: string;
  slug: string;
  showCount: number;
}
interface SearchResults {
  shows: {
    items: ShowResult[];
    total: number;
  };
  tours: {
    items: TourResult[];
    total: number;
  };
  locations: {
    items: LocationResult[];
    total: number;
  };
}
interface SearchResultsClientProps {
  initialResults: SearchResults | null;
  branches: Branch[];
  initialQuery: string;
  initialType: SearchType;
  initialBranchId: string;
  initialPage: number;
}
const statusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning'
> = {
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
export function SearchResultsClient({
  initialResults,
  branches,
  initialQuery,
  initialType,
  initialBranchId,
  initialPage,
}: SearchResultsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResults | null>(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const query = searchParams.get('q') || initialQuery;
  const type = (searchParams.get('type') as SearchType) || initialType;
  const branchId = searchParams.get('branchId') || initialBranchId;
  const page = parseInt(searchParams.get('page') || String(initialPage), 10);
  const limit = 12;
  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          type,
          page: String(page),
          limit: String(limit),
        });
        if (branchId) params.set('branchId', branchId);
        const response = await fetch(`/api/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    const paramsMatch =
      query === initialQuery &&
      type === initialType &&
      branchId === initialBranchId &&
      page === initialPage;
    if (!paramsMatch || !initialResults) {
      fetchResults();
    }
  }, [
    query,
    type,
    branchId,
    page,
    initialQuery,
    initialType,
    initialBranchId,
    initialPage,
    initialResults,
  ]);
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!('page' in updates)) {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  const totalResults =
    (results?.shows.total || 0) + (results?.tours.total || 0) + (results?.locations.total || 0);
  const getCurrentTotal = () => {
    if (type === 'shows') return results?.shows.total || 0;
    if (type === 'tours') return results?.tours.total || 0;
    if (type === 'locations') return results?.locations.total || 0;
    return totalResults;
  };
  const totalPages = Math.ceil(getCurrentTotal() / limit);
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-4 font-display text-2xl font-bold sm:text-3xl lg:text-4xl">Tìm kiếm</h1>
        <SearchBar showFilters={false} className="max-w-2xl" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            variant={type === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParams({ type: 'all' })}
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
            onClick={() => updateParams({ type: 'shows' })}
            className={cn(type === 'shows' && 'btn-primary')}
          >
            <Music className="mr-1.5 h-4 w-4" />
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
            onClick={() => updateParams({ type: 'tours' })}
            className={cn(type === 'tours' && 'btn-primary')}
          >
            <Compass className="mr-1.5 h-4 w-4" />
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
            onClick={() => updateParams({ type: 'locations' })}
            className={cn(type === 'locations' && 'btn-primary')}
          >
            <MapPin className="mr-1.5 h-4 w-4" />
            Địa điểm
            {results && (
              <Badge variant="secondary" className="ml-2">
                {results.locations.total}
              </Badge>
            )}
          </Button>
        </div>

        <div className="sm:ml-auto">
          <Select
            value={branchId || '__all__'}
            onValueChange={(val) => updateParams({ branchId: val === '__all__' ? null : val })}
          >
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

      {query && !isLoading && results && (
        <p className="mb-6 text-gray-600">
          Tìm thấy <span className="font-semibold text-gray-900">{getCurrentTotal()}</span> kết quả
          cho "<span className="font-semibold text-brand-600">{query}</span>"
        </p>
      )}

      {!query && (
        <div className="py-16 text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">Nhập từ khóa để tìm kiếm</h2>
          <p className="text-gray-500">Tìm kiếm show, tour du lịch hoặc địa điểm bạn quan tâm</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && query && results && (
        <div className="space-y-8">
          {(type === 'all' || type === 'shows') && results.shows.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Music className="h-5 w-5 text-brand-500" />
                  Shows ({results.shows.total})
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {results.shows.items.map((show) => (
                  <Card key={show.id} className="card-hover overflow-hidden">
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 sm:h-48">
                      <span className="px-4 text-center font-display text-lg font-bold text-white sm:text-xl">
                        {show.title}
                      </span>
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="line-clamp-1 font-semibold">{show.title}</h3>
                        <Badge variant={statusColors[show.status]}>
                          {statusLabels[show.status]}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-brand-500" />
                          <span className="truncate">{formatDateTime(show.performTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-brand-500" />
                          <span className="truncate">
                            {show.stage.name}, {show.stage.location.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <div>
                          {show.minPrice && (
                            <p className="text-lg font-bold text-brand-600">
                              {formatCurrency(show.minPrice)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Còn {show.availableTickets} vé</p>
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

          {(type === 'all' || type === 'tours') && results.tours.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Compass className="h-5 w-5 text-accent-500" />
                  Tours ({results.tours.total})
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {results.tours.items.map((tour) => (
                  <Card key={tour.id} className="card-hover overflow-hidden">
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent-400 to-accent-600 sm:h-48">
                      <span className="px-4 text-center font-display text-lg font-bold text-white sm:text-xl">
                        {tour.title}
                      </span>
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <h3 className="line-clamp-2 font-semibold">{tour.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {tour.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0 text-accent-500" />
                            <span>{tour.duration}</span>
                          </div>
                        )}
                        {tour.destinationLoc && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-accent-500" />
                            <span className="truncate">
                              {tour.departureLoc?.name} → {tour.destinationLoc.name}
                            </span>
                          </div>
                        )}
                        {tour.nextSchedule && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-accent-500" />
                            <span>Khởi hành: {formatDate(tour.nextSchedule.startDate)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
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

          {(type === 'all' || type === 'locations') && results.locations.items.length > 0 && (
            <div>
              {type === 'all' && (
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-success-500" />
                  Địa điểm ({results.locations.total})
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.locations.items.map((location) => (
                  <Link
                    key={location.id}
                    href={`/shows?location=${location.slug}`}
                    className="block"
                  >
                    <Card className="card-hover h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="from-success-400 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-success-600">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-1 font-semibold text-gray-900">{location.name}</h3>
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

          {totalResults === 0 && (
            <div className="py-16 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-xl font-semibold text-gray-700">Không tìm thấy kết quả</h2>
              <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Trước</span>
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => updateParams({ page: String(Math.min(totalPages, page + 1)) })}
                disabled={page === totalPages}
              >
                <span className="mr-1 hidden sm:inline">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
