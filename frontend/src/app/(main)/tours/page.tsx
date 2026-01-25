'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { Clock, MapPin, Calendar, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { branchService } from '@/services/branch.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Tour {
  id: number;
  title: string;
  slug: string;
  duration: string;
  departureLoc: { name: string } | null;
  destinationLoc: { name: string } | null;
  branch: { id: number; name: string } | null;
  minPrice: number | null;
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
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 12;

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['tours', page, branchId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (branchId !== 'all') params.append('branchId', branchId);
      if (search) params.append('search', search);
      const response = await get<ToursResponse>(`/tours?${params.toString()}`);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  if (error) {
    // console.error('Tours API Error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-error-500">
          Không thể tải danh sách tour. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2">Tour Du Lịch</h1>
        <p className="text-sm sm:text-base text-neutral-600">Khám phá các tour du lịch hấp dẫn trên khắp Việt Nam</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 h-10 bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Branch Filter */}
        <div className="w-full sm:w-48">
          <Select value={branchId} onValueChange={(val) => { setBranchId(val); setPage(1); }}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Result Info */}
      {search && !isLoading && data && (
        <p className="mb-4 text-gray-600">
          Tìm thấy <span className="font-semibold">{data.meta?.total || 0}</span> kết quả cho "{search}"
          <button onClick={clearSearch} className="ml-2 text-brand-600 hover:underline">
            Xóa bộ lọc
          </button>
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {data?.items?.map((tour) => (
            <Card key={tour.id} className="card-hover overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center">
                <span className="text-white text-xl font-display font-bold text-center px-4">
                  {tour.title}
                </span>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold line-clamp-2">{tour.title}</h3>

                <div className="space-y-2 text-sm text-neutral-600">
                  {tour.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-500" />
                      <span>{tour.duration}</span>
                    </div>
                  )}
                  {tour.destinationLoc && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      <span>
                        {tour.departureLoc?.name} → {tour.destinationLoc.name}
                      </span>
                    </div>
                  )}
                  {tour.nextSchedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-500" />
                      <span>Khởi hành: {formatDate(tour.nextSchedule.startDate)}</span>
                    </div>
                  )}
                  {tour.branch && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {tour.branch.name}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    {tour.minPrice && (
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(tour.minPrice)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">/ người</p>
                  </div>
                  <Link href={`/tours/${tour.slug}`}>
                    <Button size="sm">Xem chi tiết</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.items?.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          {search ? `Không tìm thấy tour nào cho "${search}"` : 'Chưa có tour nào. Vui lòng quay lại sau.'}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta && data.meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Trước</span>
          </Button>
          <span className="px-4 py-2 text-sm text-neutral-600">
            Trang {page} / {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages || isLoading}
          >
            <span className="hidden sm:inline mr-1">Sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
