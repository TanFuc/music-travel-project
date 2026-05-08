'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Calendar, Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VoucherForm } from '@/components/admin/VoucherForm';
import { toast } from 'sonner';
interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  owner?: {
    fullName: string;
    referralCode: string;
  };
}
export default function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vouchers', page],
    queryFn: () =>
      get<{
        items: Voucher[];
        meta: any;
      }>(`/admin/vouchers?page=${page}&limit=20`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/admin/vouchers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success('Đã xóa voucher thành công');
    },
    onError: () => toast.error('Không thể xóa voucher này'),
  });
  const handleCreate = () => {
    setEditingVoucher(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsDialogOpen(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      deleteMutation.mutate(id);
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý voucher</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            Phát hành và quản lý mã giảm giá cho khách hàng
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Tạo voucher mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách voucher</CardTitle>
          <CardDescription>Tổng cộng: {data?.meta?.total || 0} voucher</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có voucher nào.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {data.items.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="group relative rounded-lg border p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-brand-600" />
                          <span className="font-mono text-lg font-black tracking-wider text-neutral-900">
                            {voucher.code}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={voucher.isActive ? 'success' : 'destructive'}>
                            {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                          <Badge variant="outline">
                            {voucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Tiền mặt'}
                          </Badge>
                        </div>
                        {voucher.owner && (
                          <p className="text-xs font-medium text-blue-600">
                            CTV: {voucher.owner.fullName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-brand-600">
                          {voucher.discountType === 'PERCENT'
                            ? `${voucher.discountValue}%`
                            : formatCurrency(voucher.discountValue)}
                        </p>
                        <p className="text-[10px] uppercase tracking-tighter text-neutral-400">
                          GIẢM GIÁ
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-xs text-neutral-600 sm:text-sm">
                      <div className="space-y-1">
                        <p>
                          Đơn tối thiểu:{' '}
                          <span className="font-semibold">
                            {formatCurrency(voucher.minOrderValue || 0)}
                          </span>
                        </p>
                        <p>
                          Sử dụng:{' '}
                          <span className="font-semibold">
                            {voucher.usedCount} / {voucher.usageLimit || '∞'}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        {voucher.endDate ? (
                          <p className="flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3" />
                            Hết hạn: {formatDate(voucher.endDate)}
                          </p>
                        ) : (
                          <p>Vĩnh viễn</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleEdit(voucher)}
                      >
                        <Edit className="h-3 w-3" /> Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(voucher.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs text-neutral-600 sm:text-left sm:text-sm">
                    Trang {data.meta.page} / {data.meta.totalPages}
                  </p>
                  <div className="flex justify-center gap-2 sm:justify-end">
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'Cập nhật voucher' : 'Tạo voucher mới'}</DialogTitle>
            <DialogDescription>
              Nhập các thông tin chi tiết cho chương trình giảm giá của bạn.
            </DialogDescription>
          </DialogHeader>
          <VoucherForm
            initialData={editingVoucher}
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
