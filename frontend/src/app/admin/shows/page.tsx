'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, Calendar, MapPin, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Show {
    id: number;
    title: string;
    performTime: string;
    status: string;
    stage: {
        name: string;
        location: { name: string };
    };
    artists: Array<{ artist: { name: string }; isHeadline: boolean }>;
    _count: { tickets: number };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    UPCOMING: 'success',
    ONGOING: 'warning',
    ENDED: 'default',
    CANCELLED: 'destructive',
};

export default function AdminShowsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-shows', page],
        queryFn: () => get<{ items: Show[]; meta: any }>(`/admin/shows?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý sự kiện</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} sự kiện</p>
                </div>
                <Button className="gap-2">
                    <Music className="h-4 w-4" />
                    Tạo sự kiện mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách sự kiện</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có sự kiện nào.</div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {data.items.map((show) => (
                                    <div key={show.id} className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-lg">{show.title}</h3>
                                                    <Badge variant={statusColors[show.status]}>{show.status}</Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-neutral-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(show.performTime)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {show.stage.name}, {show.stage.location.name}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Ticket className="h-4 w-4" />
                                                        {show._count.tickets} vé
                                                    </div>
                                                </div>
                                                {show.artists.length > 0 && (
                                                    <div className="mt-2 text-sm text-neutral-600">
                                                        <span className="font-medium">Nghệ sĩ:</span>{' '}
                                                        {show.artists.map(a => a.artist.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm">Chi tiết</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {data.meta.totalPages > 1 && (
                                <div className="flex justify-between mt-6 pt-6 border-t">
                                    <p className="text-sm text-neutral-600">
                                        Trang {data.meta.page} / {data.meta.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                            Trước
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data.meta.totalPages}>
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
