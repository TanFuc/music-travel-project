'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
interface Voucher {
  id: number;
  code: string;
  discountType: string;
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
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vouchers', page],
    queryFn: () =>
      get<{
        items: Voucher[];
        meta: any;
      }>(`/admin/vouchers?page=${page}&limit=20`),
  });
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý voucher</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            {data?.meta?.total || 0} voucher
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto">
          <Tag className="h-4 w-4" />
          Tạo voucher mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách voucher</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có voucher nào.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                {data.items.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="rounded-lg border p-3 transition-shadow hover:shadow-md sm:p-4"
                  >
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Tag className="h-4 w-4 flex-shrink-0 text-brand-600" />
                          <span className="truncate font-mono text-base font-bold sm:text-lg">
                            {voucher.code}
                          </span>
                        </div>
                        <Badge
                          variant={voucher.isActive ? 'success' : 'destructive'}
                          className="text-xs"
                        >
                          {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                        {voucher.owner && (
                          <div className="mt-1 w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                            CTV: {voucher.owner.fullName} ({voucher.owner.referralCode})
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xl font-bold text-brand-600 sm:text-2xl">
                          {voucher.discountType === 'PERCENT'
                            ? `${voucher.discountValue}%`
                            : formatCurrency(voucher.discountValue)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-neutral-600 sm:text-sm">
                      {voucher.minOrderValue && (
                        <p>Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}</p>
                      )}
                      <p>
                        Đã dùng: {voucher.usedCount} / {voucher.usageLimit || '∞'}
                      </p>
                      {voucher.endDate && (
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          Hết hạn: {formatDate(voucher.endDate)}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Chi tiết
                    </Button>
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
    </div>
  );
}
