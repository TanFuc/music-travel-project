'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShowCard } from '@/components/shows/ShowCard';
import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { branchService } from '@/services/branch.service';
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

export default function ShowsPage() {
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
    queryKey: ['shows', page, branchId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (branchId !== 'all') params.append('branchId', branchId);
      if (search) params.append('search', search);
      const response = await get<ShowsResponse>(`/shows?${params.toString()}`);
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
    // console.error('Shows API Error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-error-500">
          Không thể tải danh sách sự kiện. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2">Sự Kiện Âm Nhạc</h1>
        <p className="text-sm sm:text-base text-neutral-600">Khám phá các show nhạc và concert hấp dẫn</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
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
          {data?.items?.map((show) => (
            <ShowCard
              key={show.id}
              {...show}
              stage={{
                ...show.stage,
                location: typeof show.stage.location === 'string'
                  ? { name: show.stage.location }
                  : show.stage.location
              }}
            />
          ))}
        </div>
      )}

      {data?.items?.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          {search ? `Không tìm thấy sự kiện nào cho "${search}"` : 'Chưa có sự kiện nào. Vui lòng quay lại sau.'}
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
            Trước
          </Button>
          <span className="px-4 py-2 text-sm text-neutral-600">
            Trang {page} / {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages || isLoading}
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
