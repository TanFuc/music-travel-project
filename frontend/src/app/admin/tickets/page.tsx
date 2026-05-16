'use client';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  MapPin,
  Music,
  QrCode,
  RotateCcw,
  Search,
  Ticket as TicketIcon,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, patch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
const TicketVerificationModal = dynamic(
  () =>
    import('@/components/admin/TicketVerificationModal').then((mod) => ({
      default: mod.TicketVerificationModal,
    })),
  { loading: () => null, ssr: false }
);
type TicketStatus = 'AVAILABLE' | 'LOCKED' | 'SOLD' | 'USED' | 'CANCELLED' | 'SUSPENDED';
interface Ticket {
  id: number;
  ticketCode: string | null;
  status: TicketStatus;
  show: {
    id: number;
    title: string;
    performTime: string;
    status: string;
    stage?: {
      id: number;
      name: string;
    } | null;
  } | null;
  ticketTier: {
    id: number;
    name: string;
    price: number;
  } | null;
  ticketClass: {
    id: number;
    name: string;
    price: number;
  } | null;
  physicalSeat: {
    zoneName: string | null;
    rowName: string | null;
    seatNumber: string | null;
    type: string;
  } | null;
  booking: {
    id: number;
    bookingCode: string;
    status: string;
    paymentStatus: string;
    user: {
      id: number;
      fullName: string;
      phoneNumber: string;
      email?: string | null;
    };
  } | null;
  redeemedShow: {
    id: number;
    title: string;
  } | null;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
}
interface ShowOption {
  id: number;
  title: string;
  performTime: string;
}
interface TicketFilters {
  page: number;
  limit: number;
  search?: string;
  status?: TicketStatus;
  checkedIn?: string;
  showId?: string;
  zoneName?: string;
  fromDate?: string;
  toDate?: string;
}
const statusOptions: Array<{
  value: TicketStatus;
  label: string;
}> = [
  { value: 'AVAILABLE', label: 'Còn trống' },
  { value: 'LOCKED', label: 'Đang giữ' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'USED', label: 'Đã dùng' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'SUSPENDED', label: 'Tạm ngưng' },
];
const statusLabels: Record<TicketStatus, string> = {
  AVAILABLE: 'Còn trống',
  LOCKED: 'Đang giữ',
  SOLD: 'Đã bán',
  USED: 'Đã dùng',
  CANCELLED: 'Đã hủy',
  SUSPENDED: 'Tạm ngưng',
};
const statusColors: Record<TicketStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
  AVAILABLE: 'success',
  LOCKED: 'warning',
  SOLD: 'default',
  USED: 'default',
  CANCELLED: 'destructive',
  SUSPENDED: 'warning',
};
const buildSeatLabel = (ticket: Ticket) => {
  if (!ticket.physicalSeat) return 'Chưa gán ghế';
  const { zoneName, rowName, seatNumber, type } = ticket.physicalSeat;
  if (type === 'STANDING') return zoneName || 'Khu đứng';
  return [zoneName, rowName ? `Hàng ${rowName}` : null, seatNumber ? `Ghế ${seatNumber}` : null]
    .filter(Boolean)
    .join(' - ');
};
const getTicketPrice = (ticket: Ticket) =>
  Number(ticket.ticketTier?.price || ticket.ticketClass?.price || 0);
export default function AdminTicketsPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<TicketStatus>('AVAILABLE');
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-tickets', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', filters.page.toString());
      params.set('limit', filters.limit.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.checkedIn) params.set('checkedIn', filters.checkedIn);
      if (filters.showId) params.set('showId', filters.showId);
      if (filters.zoneName) params.set('zoneName', filters.zoneName);
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);
      return get<{
        items: Ticket[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          summary?: {
            total: number;
            checkedIn: number;
            notCheckedIn: number;
            byStatus: Partial<Record<TicketStatus, number>>;
            zones: string[];
          };
        };
      }>(`/admin/tickets?${params.toString()}`);
    },
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
  const { data: shows } = useQuery({
    queryKey: ['admin-ticket-show-options'],
    queryFn: () =>
      get<{
        items: ShowOption[];
        meta: any;
      }>('/admin/shows?page=1&limit=100'),
    staleTime: 5 * 60 * 1000,
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TicketStatus }) =>
      patch(`/admin/tickets/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái vé');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setStatusDialogOpen(false);
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể cập nhật trạng thái vé');
    },
  });
  const activeFiltersCount = [
    filters.search,
    filters.status,
    filters.checkedIn,
    filters.showId,
    filters.zoneName,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;
  const revenueOnPage = useMemo(
    () =>
      data?.items
        ?.filter((ticket) => ticket.status === 'SOLD' || ticket.status === 'USED')
        .reduce((sum, ticket) => sum + getTicketPrice(ticket), 0) || 0,
    [data?.items]
  );
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
  };
  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };
  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
  };
  const openStatusDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNextStatus(ticket.status);
    setStatusDialogOpen(true);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý vé</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            {data?.meta?.total || 0} vé
            {isFetching && !isLoading && <span className="ml-2 text-xs">(đang tải...)</span>}
          </p>
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Tổng vé</p>
              <p className="mt-1 text-2xl font-bold">{data?.meta?.summary?.total || 0}</p>
            </div>
            <TicketIcon className="h-8 w-8 text-brand-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Đã bán</p>
              <p className="mt-1 text-2xl font-bold">{data?.meta?.summary?.byStatus?.SOLD || 0}</p>
            </div>
            <Music className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Đã check-in</p>
              <p className="mt-1 text-2xl font-bold">{data?.meta?.summary?.checkedIn || 0}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Doanh thu trang này</p>
              <p className="mt-1 text-xl font-bold text-brand-600">
                {formatCurrency(revenueOnPage)}
              </p>
            </div>
            <QrCode className="h-8 w-8 text-neutral-400" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4 sm:pt-6">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Tìm mã vé, mã đơn, khách hàng, số điện thoại, show..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái vé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.checkedIn || 'all'}
              onValueChange={(value) =>
                handleFilterChange('checkedIn', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Check-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả check-in</SelectItem>
                <SelectItem value="true">Đã check-in</SelectItem>
                <SelectItem value="false">Chưa check-in</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.showId || 'all'}
              onValueChange={(value) => handleFilterChange('showId', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Show diễn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả show</SelectItem>
                {shows?.items?.map((show) => (
                  <SelectItem key={show.id} value={show.id.toString()}>
                    {show.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.limit.toString()}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, limit: Number(value), page: 1 }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Số dòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 dòng</SelectItem>
                <SelectItem value="20">20 dòng</SelectItem>
                <SelectItem value="50">50 dòng</SelectItem>
                <SelectItem value="100">100 dòng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Lọc phân khu, khu ghế..."
                value={filters.zoneName || ''}
                onChange={(event) => handleFilterChange('zoneName', event.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              type="date"
              value={filters.fromDate || ''}
              onChange={(event) => handleFilterChange('fromDate', event.target.value)}
            />
            <Input
              type="date"
              value={filters.toDate || ''}
              onChange={(event) => handleFilterChange('toDate', event.target.value)}
            />
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="flex-1 gap-2">
                  <X className="h-4 w-4" />
                  Xóa lọc ({activeFiltersCount})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Tải lại
              </Button>
            </div>
          </div>

          {!!data?.meta?.summary?.zones?.length && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                <Filter className="h-3.5 w-3.5" />
                Phân khu:
              </span>
              {data.meta.summary.zones.slice(0, 12).map((zone) => (
                <Button
                  key={zone}
                  variant={filters.zoneName === zone ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    handleFilterChange('zoneName', filters.zoneName === zone ? '' : zone)
                  }
                >
                  {zone}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách vé</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Không tìm thấy vé phù hợp.</div>
          ) : (
            <>
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold">Mã vé</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Show / phân khu</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Hạng vé</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Khách hàng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Giá</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Check-in</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((ticket) => (
                      <tr key={ticket.id} className="border-b hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                            <div className="min-w-0">
                              <p className="truncate font-mono text-sm font-semibold">
                                {ticket.ticketCode || `#${ticket.id}`}
                              </p>
                              <p className="text-xs text-neutral-500">
                                Tạo {formatDate(ticket.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[280px] space-y-1">
                            <p className="truncate text-sm font-medium">
                              {ticket.show?.title || ticket.redeemedShow?.title || 'Chưa gán show'}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{buildSeatLabel(ticket)}</span>
                            </div>
                            {ticket.show?.performTime && (
                              <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span>{formatDate(ticket.show.performTime)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[160px] truncate text-sm">
                            {ticket.ticketTier?.name || ticket.ticketClass?.name || 'Vãng lai'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {ticket.ticketTier ? 'Ticket tier' : 'Ticket class'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {ticket.booking ? (
                            <div className="max-w-[220px] space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <User className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                                <span className="truncate">{ticket.booking.user.fullName}</span>
                              </div>
                              <p className="truncate font-mono text-xs text-neutral-500">
                                #{ticket.booking.bookingCode} · {ticket.booking.user.phoneNumber}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-500">Chưa có đơn</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                          {formatCurrency(getTicketPrice(ticket))}
                        </td>
                        <td className="px-4 py-3">
                          {ticket.isCheckedIn ? (
                            <div className="space-y-1">
                              <Badge variant="success">Đã check-in</Badge>
                              {ticket.checkedInAt && (
                                <p className="text-xs text-neutral-500">
                                  {formatDate(ticket.checkedInAt)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Chưa check-in</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[ticket.status]}>
                            {statusLabels[ticket.status] || ticket.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog(ticket)}
                            className="gap-2"
                          >
                            <Edit3 className="h-4 w-4" />
                            Cập nhật
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-sm text-neutral-600 sm:text-left">
                  Trang {data.meta.page} / {Math.max(data.meta.totalPages, 1)} ({data.meta.total}{' '}
                  vé)
                </p>
                <div className="flex justify-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= data.meta.totalPages}
                    className="gap-1"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái vé</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-neutral-50 p-3">
                <p className="font-mono text-sm font-semibold">
                  {selectedTicket.ticketCode || `#${selectedTicket.id}`}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {selectedTicket.show?.title || 'Chưa gán show'} · {buildSeatLabel(selectedTicket)}
                </p>
              </div>
              <Select
                value={nextStatus}
                onValueChange={(value) => setNextStatus(value as TicketStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái mới" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              onClick={() =>
                selectedTicket &&
                updateStatusMutation.mutate({ id: selectedTicket.id, status: nextStatus })
              }
              disabled={updateStatusMutation.isPending || !selectedTicket}
            >
              {updateStatusMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
