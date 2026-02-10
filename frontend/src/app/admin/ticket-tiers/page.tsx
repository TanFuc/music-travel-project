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

// Dynamic import for modal
const TicketTierFormModal = dynamic(
  () => import('@/components/admin/TicketTierFormModal').then((mod) => ({ default: mod.TicketTierFormModal })),
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
  tiers: Array<TicketTier & { availableQuantity: number; revenue: number; peopleCount: number }>;
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

  // Fetch ticket tiers
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-tiers', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.append('search', search);
      return get<TicketTiersResponse>(`/admin/ticket-tiers?${params.toString()}`);
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-ticket-tiers-stats'],
    queryFn: () => get<Statistics>('/admin/ticket-tiers/statistics'),
    staleTime: 5 * 60 * 1000,
  });

  // Toggle active mutation
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

  // Delete mutation
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý loại vé bán</h1>
          <p className="text-neutral-600 mt-1">
            {data?.meta?.total || 0} loại vé - Hiển thị tại trang /tickets
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Tạo loại vé mới
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
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
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
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
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
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
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
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

      {/* Search */}
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

      {/* Ticket Tiers List */}
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
            <div className="text-center py-12 text-neutral-500">
              Chưa có loại vé nào. Bấm "Tạo loại vé mới" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((tier) => {
                const available = tier.totalQuantity - tier.soldCount;
                const soldPercent =
                  tier.totalQuantity > 0 ? Math.round((tier.soldCount / tier.totalQuantity) * 100) : 0;

                return (
                  <div
                    key={tier.id}
                    className={`border rounded-lg p-4 transition-all ${!tier.isActive ? 'bg-neutral-50 opacity-60' : 'hover:border-brand-300'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tier.colorCode || '#22C55E' }}
                          />
                          <h3 className="font-semibold text-lg truncate">{tier.name}</h3>
                          <Badge variant={tier.isActive ? 'success' : 'secondary'}>
                            {tier.isActive ? 'Đang bán' : 'Tạm ngưng'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Giá:</span>
                            <span className="font-bold text-brand-600 ml-2">
                              {formatCurrency(tier.price)}
                            </span>
                            {tier.originalPrice && tier.originalPrice > tier.price && (
                              <span className="text-sm text-neutral-400 line-through ml-2">
                                {formatCurrency(tier.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500">Đã bán:</span>
                            <span className="font-semibold ml-2">
                              {tier.soldCount}/{tier.totalQuantity || '∞'}
                            </span>
                            {tier.totalQuantity > 0 && (
                              <span className="text-neutral-400 ml-1">({soldPercent}%)</span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500">Còn lại:</span>
                            <span
                              className={`font-semibold ml-2 ${tier.totalQuantity > 0 && available < 10
                                  ? 'text-orange-500'
                                  : 'text-green-600'
                                }`}
                            >
                              {tier.totalQuantity > 0 ? available : '∞'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Người/vé:</span>
                            <span className="font-semibold ml-2">{tier.groupSize}</span>
                          </div>
                        </div>

                        {tier.description && (
                          <p className="text-sm text-neutral-600 mt-2 line-clamp-1">{tier.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)} title="Sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(tier)}
                          title="Xóa"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
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

      {/* Form Modal */}
      <TicketTierFormModal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        initialData={selectedTier}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] })}
      />

      {/* Delete Confirmation */}
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
