'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Music, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
const TicketVerificationModal = dynamic(
  () =>
    import('@/components/admin/TicketVerificationModal').then((mod) => ({
      default: mod.TicketVerificationModal,
    })),
  { loading: () => null, ssr: false }
);
interface Ticket {
  id: number;
  ticketCode: string;
  status: string;
  show: {
    title: string;
  } | null;
  ticketTier: {
    name: string;
    price: number;
  } | null;
  ticketClass: {
    name: string;
    price: number;
  } | null;
  physicalSeat: {
    zoneName: string;
    rowName: string;
    seatNumber: string;
  } | null;
  isCheckedIn: boolean;
  checkedInAt: string | null;
}
const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  AVAILABLE: 'success',
  LOCKED: 'warning',
  SOLD: 'default',
  USED: 'default',
  CANCELLED: 'destructive',
};
export default function AdminTicketsPage() {
  usePageTitle();
  const [page, setPage] = useState(1);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page],
    queryFn: () =>
      get<{
        items: Ticket[];
        meta: any;
      }>(`/admin/tickets?page=${page}&limit=20`),
  });
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý vé</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">{data?.meta?.total || 0} vé</p>
        </div>
        <Button
          className="w-full gap-2 bg-brand-600 hover:bg-brand-700 sm:w-auto"
          onClick={() => setIsVerifyOpen(true)}
        >
          <QrCode className="h-4 w-4" />
          Soát vé & Check-in
        </Button>
      </div>

      <TicketVerificationModal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách vé</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có vé nào.</div>
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-semibold sm:text-sm">
                          Mã vé
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold sm:text-sm">
                          Show diễn
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold sm:text-sm md:table-cell">
                          Loại vé
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold sm:text-sm lg:table-cell">
                          Vị trí
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold sm:text-sm">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold sm:text-sm">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((ticket) => (
                        <tr key={ticket.id} className="border-b hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                              <span className="truncate font-mono text-xs sm:text-sm">
                                {ticket.ticketCode}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <Music className="hidden h-4 w-4 flex-shrink-0 text-neutral-400 sm:block" />
                              <span className="truncate text-xs sm:text-sm">
                                {ticket.show?.title ||
                                  (ticket.status === 'USED' ? 'Redeemed' : 'Chưa định danh')}
                              </span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-xs sm:text-sm md:table-cell">
                            <span className="block max-w-[150px] truncate">
                              {ticket.ticketTier?.name || ticket.ticketClass?.name || 'Vãng lai'}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-xs sm:text-sm lg:table-cell">
                            {ticket.physicalSeat
                              ? `${ticket.physicalSeat.zoneName} - ${ticket.physicalSeat.rowName}${ticket.physicalSeat.seatNumber}`
                              : 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold sm:text-sm">
                            {formatCurrency(
                              ticket.ticketTier?.price || ticket.ticketClass?.price || 0
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusColors[ticket.status]} className="text-xs">
                              {ticket.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs text-neutral-600 sm:text-left sm:text-sm">
                    Trang {data.meta.page} / {data.meta.totalPages}
                  </p>
                  <div className="flex justify-center gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.meta.totalPages}
                    >
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
