'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image as ImageIcon, Video, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';

interface Media {
    id: number;
    url: string;
    type: string;
    targetType: string;
    targetId: number;
    isFeatured: boolean;
}

export default function AdminMediaPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-media', page],
        queryFn: () => get<{ items: Media[]; meta: any }>(`/admin/media?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý media</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} files</p>
                </div>
                <Button className="gap-2">
                    <FileImage className="h-4 w-4" />
                    Upload media
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thư viện media</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có media nào.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {data.items.map((media) => (
                                    <div key={media.id} className="group relative aspect-square rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                                        {media.type === 'IMAGE' ? (
                                            <img src={media.url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                                <Video className="h-12 w-12 text-neutral-400" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-center text-white p-2">
                                                <Badge variant="secondary" className="mb-2">{media.targetType}</Badge>
                                                {media.isFeatured && <Badge variant="warning">Featured</Badge>}
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
