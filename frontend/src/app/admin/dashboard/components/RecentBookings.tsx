'use client';
import { memo, useMemo } from 'react';
import { ShoppingBag, Clock, Phone, User, Package, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { RecentBooking, BookingItem } from '@/lib/api-server';
interface RecentBookingsProps {
  bookings: RecentBooking[];
}
const STATUS_CONFIG = {
  booking: {
    PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    CONFIRMED: {
      label: 'Đã xác nhận',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    MANUAL_REVIEW: { label: 'Chờ duyệt', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  },
  payment: {
    PAID: { label: 'Đã TT', color: 'bg-emerald-500 text-white' },
    UNPAID: { label: 'Chưa TT', color: 'bg-amber-500 text-white' },
    REFUNDED: { label: 'Hoàn tiền', color: 'bg-sky-500 text-white' },
    PARTIALLY_REFUNDED: { label: 'Hoàn 1 phần', color: 'bg-indigo-500 text-white' },
  },
} as const;
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function getRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDateTime(dateString);
}
function getBookingItemsSummary(items: BookingItem[]): {
  text: string;
  count: number;
} {
  const showItems = items.filter((item) => item.ticket?.show);
  const tourItems = items.filter((item) => item.tourSchedule?.tour);
  const parts: string[] = [];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  if (showItems.length > 0) {
    const titles = [...new Set(showItems.map((item) => item.ticket?.show?.title).filter(Boolean))];
    parts.push(titles.length === 1 ? titles[0]! : `${showItems.length} vé show`);
  }
  if (tourItems.length > 0) {
    const titles = [
      ...new Set(tourItems.map((item) => item.tourSchedule?.tour?.title).filter(Boolean)),
    ];
    parts.push(titles.length === 1 ? titles[0]! : `${tourItems.length} tour`);
  }
  return { text: parts.join(' - ') || 'Không có sản phẩm', count: totalCount };
}
interface BookingCardProps {
  booking: RecentBooking;
}
const BookingCard = memo(function BookingCard({ booking }: BookingCardProps) {
  const { text: itemsSummary, count: totalQuantity } = useMemo(
    () => (booking.items ? getBookingItemsSummary(booking.items) : { text: '', count: 0 }),
    [booking.items]
  );
  const statusConfig = STATUS_CONFIG.booking[booking.status as keyof typeof STATUS_CONFIG.booking];
  const paymentConfig =
    STATUS_CONFIG.payment[booking.paymentStatus as keyof typeof STATUS_CONFIG.payment];
  return (
    <div className="group relative transform overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:scale-[1.01] hover:border-brand-300 hover:shadow-lg">
      <div
        className={`absolute bottom-0 left-0 top-0 w-1.5 ${
          booking.paymentStatus === 'PAID'
            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-b from-amber-500 to-amber-600'
        }`}
      />

      <div className="py-4 pl-5 pr-4 sm:py-5 sm:pl-6 sm:pr-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="whitespace-nowrap rounded-lg bg-brand-50 px-2.5 py-1 font-mono text-sm font-bold text-brand-600">
              {booking.bookingCode}
            </span>
            <span
              className={`whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusConfig?.color || 'bg-slate-100 text-slate-600'}`}
            >
              {statusConfig?.label || booking.status}
            </span>
            <span
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold text-white ${paymentConfig?.color || 'bg-slate-500'}`}
            >
              {paymentConfig?.label || booking.paymentStatus}
            </span>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-lg font-bold text-brand-600">
              {formatCurrency(booking.finalAmount)}
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {booking.user.fullName}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                {booking.user.phoneNumber}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-50">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-slate-700" title={itemsSummary}>
                {itemsSummary}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                <span className="text-slate-900">{totalQuantity}</span> sản phẩm
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDateTime(booking.createdAt)}</span>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-500">
            {getRelativeTime(booking.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
});
export const RecentBookings = memo(function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span>Đơn hàng gần đây</span>
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              10 đơn hàng mới nhất trên hệ thống
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 whitespace-nowrap rounded-lg border-slate-300 bg-white text-xs font-medium hover:bg-slate-50 sm:flex"
          >
            Xem tất cả
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!bookings?.length ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">Chưa có đơn hàng nào</p>
            <p className="mt-1 text-sm text-slate-500">Các đơn hàng sẽ xuất hiện tại đây</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
