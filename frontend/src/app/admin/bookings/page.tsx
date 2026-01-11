'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, User, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Booking {
    id: number;
    bookingCode: string;
    user: { fullName: string; phoneNumber: string };
    finalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: any[];
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'destructive',
    COMPLETED: 'default',
};

export default function AdminBookingsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-bookings', page, statusFilter],
        queryFn: () => {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (statusFilter) params.append('status', statusFilter);
            return get<{ items: Booking[]; meta: any }>(`/admin/bookings?${params.toString()}`);
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} đơn hàng</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <Button variant={!statusFilter ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>
                            Tất cả
                        </Button>
                        <Button variant={statusFilter === 'PENDING' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('PENDING')}>
                            Chờ xử lý
                        </Button>
                        <Button variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('CONFIRMED')}>
                            Đã xác nhận
                        </Button>
                        <Button variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('COMPLETED')}>
                            Hoàn thành
                        </Button>
                        <Button variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('CANCELLED')}>
                            Đã hủy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có đơn hàng nào.</div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {data.items.map((booking) => (
                                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-mono font-semibold">#{booking.bookingCode}</span>
                                                    <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                                                    <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                                        {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-neutral-600">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {booking.user.fullName} - {booking.user.phoneNumber}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(booking.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingBag className="h-4 w-4" />
                                                        {booking.items.length} sản phẩm
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-brand-600">{formatCurrency(booking.finalAmount)}</p>
                                                <Button variant="outline" size="sm" className="mt-2">Chi tiết</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {data.meta.totalPages > 1 && (
                                <div className="flex justify-between mt-6 pt-6 border-t">
                                    <p className="text-sm text-neutral-600">Trang {data.meta.page} / {data.meta.totalPages}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Trước</Button>
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data.meta.totalPages}>Sau</Button>
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
