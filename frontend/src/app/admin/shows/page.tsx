'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Music, Calendar, MapPin, Ticket, QrCode, Eye, Plus } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { getCloudinaryUrl } from '@/lib/cloudinary';

// Dynamic import for heavy modal - only loads when opened
const ShowFormModal = dynamic(() => import('@/components/admin/ShowFormModal').then(mod => ({ default: mod.ShowFormModal })), {
    loading: () => null,
    ssr: false,
});

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
    properties?: {
        thumbnailUrl?: string;
    };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    UPCOMING: 'success',
    ONGOING: 'warning',
    ENDED: 'default',
    CANCELLED: 'destructive',
};

export default function AdminShowsPage() {
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-shows', page],
        queryFn: () => get<{ items: Show[]; meta: any }>(`/admin/shows?page=${page}&limit=20`),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Quản lý show diễn</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mt-1">{data?.meta?.total || 0} show diễn</p>
                </div>
                <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Tạo show diễn mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách show diễn</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có show diễn nào.</div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {data.items.map((show) => (
                                    <div key={show.id} className="border rounded-lg p-3 sm:p-4 hover:bg-neutral-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                                            <div className="w-full lg:w-32 h-20 lg:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 border">
                                                {show.properties?.thumbnailUrl ? (
                                                    <img
                                                        src={getCloudinaryUrl(show.properties.thumbnailUrl, 'small')}
                                                        alt={show.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <Music className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-base sm:text-lg">{show.title}</h3>
                                                    <Badge variant={statusColors[show.status]}>{show.status}</Badge>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{formatDate(show.performTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{show.stage.name}, {show.stage.location.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Ticket className="h-4 w-4 flex-shrink-0" />
                                                        {show._count.tickets} vé
                                                    </div>
                                                </div>
                                                {show.artists.length > 0 && (
                                                    <div className="mt-2 text-xs sm:text-sm text-neutral-600">
                                                        <span className="font-medium">Nghệ sĩ:</span>{' '}
                                                        {show.artists.map(a => a.artist.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 justify-end lg:justify-start">
                                                <Link href={`/admin/shows/${show.id}/qr-codes`}>
                                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                                        <QrCode className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">QR</span>
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/shows/${show.id}`}>
                                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                                        <Eye className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Chi tiết</span>
                                                    </Button>
                                                </Link>
                                            </div>
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

            {/* Show Form Modal */}
            <ShowFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
                }}
            />
        </div>
    );
}
