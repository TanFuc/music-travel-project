'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  Package,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { get, del, patch } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';
const TicketTierFormModal = dynamic(
  () =>
    import('@/components/admin/TicketTierFormModal').then((mod) => ({
      default: mod.TicketTierFormModal,
    })),
  { loading: () => null, ssr: false }
);
interface TicketTier {
  id: number;
  name: string;
  nameEn?: string | null;
  price: number;
  originalPrice?: number | null;
  description?: string | null;
  benefits?: string | null;
  targetAudience?: string | null;
  colorCode?: string | null;
  priority: number;
  groupSize: number;
  totalQuantity: number;
  soldCount: number;
  maxPerOrder: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    bookingItems: number;
    cartItems: number;
  };
}
interface TicketTiersResponse {
  items: TicketTier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
interface Statistics {
  tiers: Array<
    TicketTier & {
      availableQuantity: number;
      revenue: number;
      peopleCount: number;
    }
  >;
  summary: {
    totalTiers: number;
    totalCapacity: number;
    totalSold: number;
    totalAvailable: number;
    totalRevenue: number;
    totalPeople: number;
    soldPercentage: number;
  };
}
export default function AdminTicketTiersPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TicketTier | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-tiers', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.append('search', search);
      return get<TicketTiersResponse>(`/admin/ticket-tiers?${params.toString()}`);
    },
    staleTime: 2 * 60 * 1000,
  });
  const { data: stats } = useQuery({
    queryKey: ['admin-ticket-tiers-stats'],
    queryFn: () => get<Statistics>('/admin/ticket-tiers/statistics'),
    staleTime: 5 * 60 * 1000,
  });
  const toggleMutation = useMutation({
    mutationFn: (id: number) => patch(`/admin/ticket-tiers/${id}/toggle-active`, {}),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/admin/ticket-tiers/${id}`),
    onSuccess: () => {
      toast.success('Xóa loại vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      setDeleteTarget(null);
    },
  });
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };
  const handleEdit = (tier: TicketTier) => {
    setSelectedTier(tier);
    setIsFormOpen(true);
  };
  const handleCreate = () => {
    setSelectedTier(null);
    setIsFormOpen(true);
  };
  const handleCloseModal = () => {
    setIsFormOpen(false);
    setSelectedTier(null);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý loại vé bán</h1>
          <p className="mt-1 text-neutral-600">
            {data?.meta?.total || 0} loại vé - Hiển thị tại trang /tickets
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Tạo loại vé mới
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Tags className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Loại vé</p>
                  <p className="text-xl font-bold">{stats.summary.totalTiers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Đã bán</p>
                  <p className="text-xl font-bold">
                    {stats.summary.totalSold}/{stats.summary.totalCapacity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Số người</p>
                  <p className="text-xl font-bold">{stats.summary.totalPeople}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Doanh thu</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.summary.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            {search && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                }}
              >
                Xóa lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách loại vé</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">
              Chưa có loại vé nào. Bấm "Tạo loại vé mới" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((tier) => {
                const available = tier.totalQuantity - tier.soldCount;
                const soldPercent =
                  tier.totalQuantity > 0
                    ? Math.round((tier.soldCount / tier.totalQuantity) * 100)
                    : 0;
                return (
                  <div
                    key={tier.id}
                    className={`rounded-lg border p-4 transition-all ${!tier.isActive ? 'bg-neutral-50 opacity-60' : 'hover:border-brand-300'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: tier.colorCode || '#22C55E' }}
                          />
                          <h3 className="truncate text-lg font-semibold">{tier.name}</h3>
                          <Badge variant={tier.isActive ? 'success' : 'secondary'}>
                            {tier.isActive ? 'Đang bán' : 'Tạm ngưng'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <span className="text-neutral-500">Giá:</span>
                            <span className="ml-2 font-bold text-brand-600">
                              {formatCurrency(tier.price)}
                            </span>
                            {tier.originalPrice && tier.originalPrice > tier.price && (
                              <span className="ml-2 text-sm text-neutral-400 line-through">
                                {formatCurrency(tier.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500">Đã bán:</span>
                            <span className="ml-2 font-semibold">
                              {tier.soldCount}/{tier.totalQuantity || '∞'}
                            </span>
                            {tier.totalQuantity > 0 && (
                              <span className="ml-1 text-neutral-400">({soldPercent}%)</span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500">Còn lại:</span>
                            <span
                              className={`ml-2 font-semibold ${
                                tier.totalQuantity > 0 && available < 10
                                  ? 'text-orange-500'
                                  : 'text-green-600'
                              }`}
                            >
                              {tier.totalQuantity > 0 ? available : '∞'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Người/vé:</span>
                            <span className="ml-2 font-semibold">{tier.groupSize}</span>
                          </div>
                        </div>

                        {tier.description && (
                          <p className="mt-2 line-clamp-1 text-sm text-neutral-600">
                            {tier.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleMutation.mutate(tier.id)}
                          title={tier.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                        >
                          {tier.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-neutral-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tier)}
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(tier)}
                          title="Xóa"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-neutral-600">
                    Trang {data.meta.page} / {data.meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.meta.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TicketTierFormModal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        initialData={selectedTier}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] })}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Xóa loại vé"
        message={`Bạn có chắc muốn xóa loại vé "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
