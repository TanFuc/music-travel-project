'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    user: { fullName: string; phoneNumber: string };
}

const typeColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    ORDER: 'success',
    PROMOTION: 'warning',
    SYSTEM: 'default',
};

export default function AdminNotificationsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-notifications', page],
        queryFn: () => get<{ items: Notification[]; meta: any }>(`/admin/notifications?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý thông báo</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} thông báo</p>
                </div>
                <Button className="gap-2">
                    <Bell className="h-4 w-4" />
                    Gửi thông báo mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thông báo</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có thông báo nào.</div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {data.items.map((notification) => (
                                    <div key={notification.id} className={`border rounded-lg p-4 ${notification.isRead ? 'bg-neutral-50' : 'bg-white'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                                <Bell className="h-5 w-5 text-brand-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{notification.title}</h3>
                                                    <Badge variant={typeColors[notification.type]}>{notification.type}</Badge>
                                                    {!notification.isRead && <Badge variant="destructive">Mới</Badge>}
                                                </div>
                                                <p className="text-sm text-neutral-600 mb-2">{notification.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {notification.user.fullName}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(notification.createdAt)}
                                                    </div>
                                                </div>
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
