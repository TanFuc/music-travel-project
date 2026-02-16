'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Percent, Calendar } from 'lucide-react';
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
        queryFn: () => get<{ items: Voucher[]; meta: any }>(`/admin/vouchers?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Quản lý voucher</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mt-1">{data?.meta?.total || 0} voucher</p>
                </div>
                <Button className="gap-2 w-full sm:w-auto">
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
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có voucher nào.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {data.items.map((voucher) => (
                                    <div key={voucher.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Tag className="h-4 w-4 text-brand-600 flex-shrink-0" />
                                                    <span className="font-mono font-bold text-base sm:text-lg truncate">{voucher.code}</span>
                                                </div>
                                                <Badge variant={voucher.isActive ? 'success' : 'destructive'} className="text-xs">
                                                    {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </Badge>
                                                {voucher.owner && (
                                                    <div className="mt-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                                        CTV: {voucher.owner.fullName} ({voucher.owner.referralCode})
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xl sm:text-2xl font-bold text-brand-600">
                                                    {voucher.discountType === 'PERCENT'
                                                        ? `${voucher.discountValue}%`
                                                        : formatCurrency(voucher.discountValue)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-xs sm:text-sm text-neutral-600">
                                            {voucher.minOrderValue && (
                                                <p>Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}</p>
                                            )}
                                            <p>Đã dùng: {voucher.usedCount} / {voucher.usageLimit || '∞'}</p>
                                            {voucher.endDate && (
                                                <p className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                                    Hết hạn: {formatDate(voucher.endDate)}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-3">Chi tiết</Button>
                                    </div>
                                ))}
                            </div>

                            {data.meta.totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t">
                                    <p className="text-xs sm:text-sm text-neutral-600 text-center sm:text-left">Trang {data.meta.page} / {data.meta.totalPages}</p>
                                    <div className="flex gap-2 justify-center sm:justify-end">
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
