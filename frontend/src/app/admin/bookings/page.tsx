'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  User,
  Calendar,
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  MapPin,
  Ticket,
  Phone,
  Mail,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, patch, post } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
interface BookingItem {
  id: number;
  itemType: string;
  itemTypeLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  ticketClass?: {
    name: string;
    colorCode?: string;
  };
  ticketTier?: {
    name: string;
    colorCode?: string;
    description?: string;
    benefits?: string;
  };
  singerPackage?: {
    name: string;
    colorCode?: string;
    description?: string;
  };
  show?: {
    id: number;
    title: string;
    performTime?: string;
    startDate?: string;
    stage?: {
      name: string;
      address: string;
    };
  };
  tour?: {
    id: number;
    title: string;
    departureDate?: string;
    duration?: string;
  };
}
interface Booking {
  id: number;
  bookingCode: string;
  user: {
    id: number;
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  finalAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  note?: string;
  itemCount: number;
  items: BookingItem[];
  transactions?: Array<{
    id: number;
    paymentMethod: string;
    amount: number;
    status: string;
    payTime?: string;
    createdAt: string;
  }>;
  voucher?: {
    code: string;
    discountValue: number;
    owner?: {
      id: number;
      fullName: string;
      referralCode: string;
      phoneNumber: string;
    };
  };
}
interface BookingFilters {
  page: number;
  limit: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
const getStatusDisplay = (booking: { status: string; paymentStatus: string }) => {
  if (booking.status === 'CANCELLED') {
    return { label: 'Đã hủy', variant: 'destructive' as const };
  }
  if (booking.paymentStatus === 'UNPAID') {
    return { label: 'Chưa thanh toán', variant: 'warning' as const };
  }
  if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
    return { label: 'Đã xử lý', variant: 'success' as const };
  }
  return { label: 'Chờ xử lý', variant: 'default' as const };
};
const paymentMethodLabels: Record<string, string> = {
  WALLET: 'Ví điện tử',
  BANK_TRANSFER: 'Chuyển khoản',
  CASH: 'Tiền mặt',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
};
const formatShortDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
export default function AdminBookingsPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      return get<{
        items: Booking[];
        meta: any;
      }>(`/admin/bookings?${params.toString()}`);
    },
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
  const { data: bookingDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin-booking-detail', selectedBooking?.id],
    queryFn: () => get<Booking>(`/admin/bookings/${selectedBooking?.id}`),
    enabled: !!selectedBooking?.id && detailsOpen,
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      patch(`/admin/bookings/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail'] });
      setStatusUpdateOpen(false);
      setDetailsOpen(false);
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại');
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (id: number) => post(`/admin/bookings/${id}/cancel`, {}),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setDetailsOpen(false);
    },
    onError: () => {
      toast.error('Hủy đơn hàng thất bại');
    },
  });
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };
  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };
  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchInput('');
  };
  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };
  const openStatusUpdate = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusUpdateOpen(true);
  };
  const handleStatusUpdate = () => {
    if (selectedBooking && newStatus) {
      updateStatusMutation.mutate({ id: selectedBooking.id, status: newStatus });
    }
  };
  const handleCancel = (booking: Booking) => {
    if (confirm(`Bạn có chắc muốn hủy đơn hàng #${booking.bookingCode}?`)) {
      cancelMutation.mutate(booking.id);
    }
  };
  const activeFiltersCount = [
    filters.status,
    filters.paymentStatus,
    filters.search,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            {data?.meta?.total || 0} đơn hàng
            {isFetching && !isLoading && <span className="ml-2 text-xs">(đang tải...)</span>}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4 sm:pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PROCESSED">Đã xử lý</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus || 'all'}
              onValueChange={(v) => handleFilterChange('paymentStatus', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Từ ngày"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-[150px]"
            />

            <Input
              type="date"
              placeholder="Đến ngày"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-[150px]"
            />

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Xóa bộ lọc ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">
              <ShoppingBag className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>Không tìm thấy đơn hàng nào.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data.items.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="grid grid-cols-12 items-center gap-4">
                      <div className="col-span-12 sm:col-span-3 lg:col-span-2">
                        <div className="flex flex-col gap-2">
                          <span className="truncate font-mono text-sm font-semibold">
                            #{booking.bookingCode}
                          </span>
                          <Badge variant={getStatusDisplay(booking).variant} className="w-fit">
                            {getStatusDisplay(booking).label}
                          </Badge>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                        <div className="space-y-1 text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{booking.user.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{booking.user.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-5 lg:col-span-3">
                        <div className="space-y-1 text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">
                              {formatShortDateTime(booking.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">{booking.itemCount} sản phẩm</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-6 text-left sm:col-span-6 lg:col-span-2 lg:text-right">
                        <p className="text-lg font-bold text-brand-600">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                        {booking.paymentMethod && (
                          <p className="text-xs text-neutral-500">
                            {paymentMethodLabels[booking.paymentMethod] || booking.paymentMethod}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 flex justify-end gap-2 sm:col-span-6 lg:col-span-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(booking)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="h-4 w-4 lg:mr-1" />
                          <span className="hidden lg:inline">Chi tiết</span>
                        </Button>
                        {(booking.status === 'PENDING' || booking.status === 'MANUAL_REVIEW') &&
                          booking.paymentStatus === 'PAID' && (
                            <Button
                              size="sm"
                              onClick={() => openStatusUpdate(booking)}
                              className="whitespace-nowrap"
                            >
                              <CheckCircle className="h-4 w-4 lg:mr-1" />
                              <span className="hidden lg:inline">Duyệt</span>
                            </Button>
                          )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1 border-t pt-3">
                      {booking.items.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="max-w-[200px] truncate rounded bg-neutral-100 px-2 py-0.5 text-xs"
                        >
                          {item.productName &&
                          item.productName !== 'N/A' &&
                          item.productName !== 'Sản phẩm không xác định'
                            ? item.productName
                            : (item as any).show?.title ||
                              (item as any).tour?.title ||
                              (item as any).ticketClass?.name ||
                              (item as any).ticketTier?.name ||
                              (item as any).singerPackage?.name ||
                              'Sản phẩm'}
                        </span>
                      ))}
                      {booking.items.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{booking.items.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-6">
                  <p className="text-sm text-neutral-600">
                    Trang {data.meta.page} / {data.meta.totalPages} ({data.meta.total} đơn hàng)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                      disabled={filters.page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                      disabled={filters.page === data.meta.totalPages}
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Chi tiết đơn hàng
              {selectedBooking && (
                <span className="font-mono text-brand-600">#{selectedBooking.bookingCode}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : bookingDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-gradient-to-r from-brand-50 to-purple-50 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={getStatusDisplay(bookingDetails).variant}
                    className="px-3 py-1 text-sm"
                  >
                    {getStatusDisplay(bookingDetails).label}
                  </Badge>
                  {bookingDetails.paymentMethod && (
                    <Badge variant="outline" className="text-sm">
                      <CreditCard className="mr-1 h-3 w-3" />
                      {paymentMethodLabels[bookingDetails.paymentMethod] ||
                        bookingDetails.paymentMethod}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-600">
                    {formatCurrency(bookingDetails.finalAmount)}
                  </p>
                  <p className="text-xs text-neutral-500">Tổng thanh toán</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border bg-white p-3 lg:col-span-1">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
                    <User className="h-3.5 w-3.5" />
                    Khách hàng
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 flex-shrink-0 text-neutral-400" />
                      <span className="truncate">{bookingDetails.user.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 flex-shrink-0 text-neutral-400" />
                      <span>{bookingDetails.user.phoneNumber}</span>
                    </div>
                    {bookingDetails.user.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 flex-shrink-0 text-neutral-400" />
                        <span className="truncate text-xs">{bookingDetails.user.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 border-t pt-3 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatShortDateTime(bookingDetails.createdAt)}</span>
                    </div>
                    {bookingDetails.paidAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Đã TT: {formatShortDateTime(bookingDetails.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white p-3 lg:col-span-2">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
                    <Package className="h-3.5 w-3.5" />
                    Sản phẩm ({bookingDetails.items.length})
                  </h3>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                    {bookingDetails.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded border bg-neutral-50 p-2.5 transition-colors hover:bg-neutral-100"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-1.5">
                              <Badge variant="outline" className="px-1.5 py-0 text-xs">
                                {item.itemTypeLabel || item.itemType}
                              </Badge>
                              <span className="text-xs text-neutral-400">#{index + 1}</span>
                            </div>
                            <h4 className="truncate text-sm font-medium">
                              {item.productName &&
                              item.productName !== 'N/A' &&
                              item.productName !== 'Sản phẩm không xác định'
                                ? item.productName
                                : item.show?.title ||
                                  item.tour?.title ||
                                  item.ticketClass?.name ||
                                  item.ticketTier?.name ||
                                  item.singerPackage?.name ||
                                  'Sản phẩm'}
                            </h4>

                            <div className="mt-1 space-y-0.5 text-xs text-neutral-600">
                              {(item.ticketClass || item.ticketTier) && (
                                <div className="flex items-center gap-1">
                                  <Ticket className="h-3 w-3" />
                                  <span>{item.ticketClass?.name || item.ticketTier?.name}</span>
                                </div>
                              )}
                              {item.show && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatShortDateTime(
                                      item.show.startDate || item.show.performTime || ''
                                    )}
                                  </span>
                                  {item.show.stage && (
                                    <>
                                      <span className="text-neutral-400">•</span>
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate">{item.show.stage.name}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {item.tour && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Khởi hành: {formatShortDateTime(item.tour.departureDate || '')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-neutral-500">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                            <p className="text-sm font-semibold text-brand-600">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(bookingDetails.totalAmount)}</span>
                    </div>
                    {bookingDetails.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(bookingDetails.discountAmount)}</span>
                      </div>
                    )}
                    {bookingDetails.voucher && (
                      <div className="flex justify-between border-t border-dashed pt-1 text-xs text-neutral-500">
                        <span>Mã giảm giá:</span>
                        <span className="font-mono">{bookingDetails.voucher.code}</span>
                      </div>
                    )}
                    {bookingDetails.voucher?.owner && (
                      <div className="flex justify-between pt-1 text-xs text-blue-600">
                        <span>CTV giới thiệu:</span>
                        <span className="font-medium">
                          {bookingDetails.voucher.owner.fullName} (
                          {bookingDetails.voucher.owner.referralCode})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1.5 text-base font-semibold">
                      <span>Tổng cộng</span>
                      <span className="text-brand-600">
                        {formatCurrency(bookingDetails.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            {bookingDetails &&
              bookingDetails.status !== 'CANCELLED' &&
              bookingDetails.status !== 'COMPLETED' && (
                <>
                  {(bookingDetails.status === 'PENDING' ||
                    bookingDetails.status === 'MANUAL_REVIEW') &&
                    bookingDetails.paymentStatus === 'PAID' && (
                      <Button
                        variant="default"
                        onClick={() => {
                          setDetailsOpen(false);
                          openStatusUpdate(bookingDetails);
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Duyệt đơn
                      </Button>
                    )}
                  {(bookingDetails.status === 'PENDING' ||
                    bookingDetails.status === 'MANUAL_REVIEW') &&
                    bookingDetails.paymentStatus === 'UNPAID' && (
                      <div className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-600">
                        ⚠️ Chỉ có thể duyệt đơn khi khách hàng đã thanh toán
                      </div>
                    )}
                  <Button
                    variant="destructive"
                    onClick={() => handleCancel(bookingDetails)}
                    disabled={cancelMutation.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Hủy đơn
                  </Button>
                </>
              )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Đơn hàng:{' '}
                <span className="font-mono font-semibold">#{selectedBooking.bookingCode}</span>
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium">Trạng thái mới</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Đã xử lý</SelectItem>
                    <SelectItem value="CANCELLED">Hủy đơn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending || !newStatus}
            >
              {updateStatusMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
