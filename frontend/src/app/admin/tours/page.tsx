'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

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
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tours', page],
        queryFn: () => get<{ items: Tour[]; meta: any }>(`/admin/tours?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý tour</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} tour</p>
                </div>
                <Button className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Tạo tour mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tour</CardTitle>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.items.map((tour) => (
                                    <div key={tour.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="font-semibold text-lg mb-2">{tour.title}</h3>
                                        <div className="space-y-2 text-sm text-neutral-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {tour.duration}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {tour.departureLoc?.name || 'N/A'} → {tour.destinationLoc?.name || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {tour._count.schedules} lịch trình
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-4">Chi tiết</Button>
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
