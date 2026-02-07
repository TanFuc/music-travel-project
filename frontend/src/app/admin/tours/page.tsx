'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Tour {
    id: number;
    title: string;
    duration: string;
    departureLoc: { name: string } | null;
    destinationLoc: { name: string } | null;
    createdAt: string;
    _count: { schedules: number };
}

export default function AdminToursPage() {
    usePageTitle();
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tours', page],
        queryFn: () => get<{ items: Tour[]; meta: any }>(`/admin/tours?page=${page}&limit=20`),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        placeholderData: (previousData) => previousData, // Keep previous data while loading new
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Quản lý tour</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mt-1">{data?.meta?.total || 0} tour</p>
                </div>
                <Button className="gap-2 w-full sm:w-auto">
                    <MapPin className="h-4 w-4" />
                    Tạo tour mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Danh sách tour</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có tour nào.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {data.items.map((tour) => (
                                    <div key={tour.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                                        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{tour.title}</h3>
                                        <div className="space-y-2 text-xs sm:text-sm text-neutral-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{tour.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{tour.departureLoc?.name || 'N/A'} → {tour.destinationLoc?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 flex-shrink-0" />
                                                {tour._count.schedules} lịch trình
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-3 sm:mt-4">Chi tiết</Button>
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
