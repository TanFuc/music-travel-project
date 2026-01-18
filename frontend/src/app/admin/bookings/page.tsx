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
        staleTime: 2 * 60 * 1000, // 2 minutes cache
        placeholderData: (previousData) => previousData, // Keep previous data while loading new
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Quản lý đơn hàng</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mt-1">{data?.meta?.total || 0} đơn hàng</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                        <Button variant={!statusFilter ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter(''); setPage(1); }} className="whitespace-nowrap">
                            Tất cả
                        </Button>
                        <Button variant={statusFilter === 'PENDING' ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter('PENDING'); setPage(1); }} className="whitespace-nowrap">
                            Chờ xử lý
                        </Button>
                        <Button variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter('CONFIRMED'); setPage(1); }} className="whitespace-nowrap">
                            Đã xác nhận
                        </Button>
                        <Button variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter('COMPLETED'); setPage(1); }} className="whitespace-nowrap">
                            Hoàn thành
                        </Button>
                        <Button variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'} size="sm" onClick={() => { setStatusFilter('CANCELLED'); setPage(1); }} className="whitespace-nowrap">
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
                                    <div key={booking.id} className="border rounded-lg p-3 sm:p-4 hover:bg-neutral-50">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="font-mono text-sm sm:text-base font-semibold">#{booking.bookingCode}</span>
                                                    <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                                                    <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                                        {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-neutral-600">
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
                                            <div className="text-left lg:text-right flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 pt-3 lg:pt-0 border-t lg:border-t-0">
                                                <p className="text-base sm:text-lg font-bold text-brand-600">{formatCurrency(booking.finalAmount)}</p>
                                                <Button variant="outline" size="sm" className="whitespace-nowrap">Chi tiết</Button>
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
