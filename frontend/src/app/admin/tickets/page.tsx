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
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Quản lý vé</h1>
                    <p className="text-sm sm:text-base text-neutral-600 mt-1">{data?.meta?.total || 0} vé</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Danh sách vé</CardTitle>
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
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">Mã vé</th>
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">Sự kiện</th>
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm hidden md:table-cell">Loại vé</th>
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm hidden lg:table-cell">Vị trí</th>
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">Giá</th>
                                                <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map((ticket) => (
                                                <tr key={ticket.id} className="border-b hover:bg-neutral-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <QrCode className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                                            <span className="font-mono text-xs sm:text-sm truncate">{ticket.ticketCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Music className="h-4 w-4 text-neutral-400 flex-shrink-0 hidden sm:block" />
                                                            <span className="text-xs sm:text-sm truncate">{ticket.show.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs sm:text-sm hidden md:table-cell">
                                                        <span className="truncate block max-w-[150px]">{ticket.ticketClass.name}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs sm:text-sm hidden lg:table-cell">
                                                        {ticket.physicalSeat
                                                            ? `${ticket.physicalSeat.zoneName} - ${ticket.physicalSeat.rowName}${ticket.physicalSeat.seatNumber}`
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">{formatCurrency(ticket.ticketClass.price)}</td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant={statusColors[ticket.status]} className="text-xs">{ticket.status}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
