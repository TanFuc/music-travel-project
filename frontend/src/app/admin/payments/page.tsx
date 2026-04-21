'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
interface Payment {
  id: number;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    bookingCode: string;
    user: {
      fullName: string;
      phoneNumber: string;
    };
  };
}
const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  REFUNDED: 'default',
};
export default function AdminPaymentsPage() {
  usePageTitle();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () =>
      get<{
        items: Payment[];
        meta: any;
      }>(`/admin/payments?page=${page}&limit=20`),
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
          <p className="mt-1 text-neutral-600">{data?.meta?.total || 0} giao dịch</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có giao dịch nào.</div>
          ) : (
            <>
              <div className="space-y-3">
                {data.items.map((payment) => (
                  <div key={payment.id} className="rounded-lg border p-4 hover:bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-mono font-semibold">
                            #{payment.booking.bookingCode}
                          </span>
                          <Badge variant={statusColors[payment.status]}>{payment.status}</Badge>
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </div>
                        <div className="text-sm text-neutral-600">
                          {payment.booking.user.fullName} - {payment.booking.user.phoneNumber}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-brand-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex justify-between border-t pt-6">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
