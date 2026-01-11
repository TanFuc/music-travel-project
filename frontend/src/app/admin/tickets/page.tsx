'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ticket as TicketIcon, Music, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Ticket {
    id: number;
    ticketCode: string;
    status: string;
    show: { title: string };
    ticketClass: { name: string; price: number };
    physicalSeat: { zoneName: string; rowName: string; seatNumber: string } | null;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    AVAILABLE: 'success',
    LOCKED: 'warning',
    SOLD: 'default',
};

export default function AdminTicketsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tickets', page],
        queryFn: () => get<{ items: Ticket[]; meta: any }>(`/admin/tickets?page=${page}&limit=20`),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý vé</h1>
                    <p className="text-neutral-600 mt-1">{data?.meta?.total || 0} vé</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách vé</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : !data?.items?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có vé nào.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Mã vé</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Sự kiện</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Loại vé</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Vị trí</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Giá</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((ticket) => (
                                            <tr key={ticket.id} className="border-b hover:bg-neutral-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <QrCode className="h-4 w-4 text-neutral-400" />
                                                        <span className="font-mono text-sm">{ticket.ticketCode}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Music className="h-4 w-4 text-neutral-400" />
                                                        <span className="text-sm">{ticket.show.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{ticket.ticketClass.name}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    {ticket.physicalSeat
                                                        ? `${ticket.physicalSeat.zoneName} - ${ticket.physicalSeat.rowName}${ticket.physicalSeat.seatNumber}`
                                                        : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(ticket.ticketClass.price)}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
