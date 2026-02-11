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
    PENDING: { label: 'Cho xu ly', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Da xac nhan', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Da huy', color: 'bg-red-100 text-red-700 border-red-200' },
    COMPLETED: { label: 'Hoan thanh', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    MANUAL_REVIEW: { label: 'Cho duyet', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  },
  payment: {
    PAID: { label: 'Da TT', color: 'bg-emerald-500 text-white' },
    UNPAID: { label: 'Chua TT', color: 'bg-amber-500 text-white' },
    REFUNDED: { label: 'Hoan tien', color: 'bg-sky-500 text-white' },
    PARTIALLY_REFUNDED: { label: 'Hoan 1 phan', color: 'bg-indigo-500 text-white' },
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

  if (diffMins < 1) return 'Vua xong';
  if (diffMins < 60) return `${diffMins} phut truoc`;
  if (diffHours < 24) return `${diffHours} gio truoc`;
  if (diffDays < 7) return `${diffDays} ngay truoc`;
  return formatDateTime(dateString);
}

function getBookingItemsSummary(items: BookingItem[]): { text: string; count: number } {
  const showItems = items.filter((item) => item.ticket?.show);
  const tourItems = items.filter((item) => item.tourSchedule?.tour);
  const parts: string[] = [];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (showItems.length > 0) {
    const titles = [...new Set(showItems.map((item) => item.ticket?.show?.title).filter(Boolean))];
    parts.push(titles.length === 1 ? titles[0]! : `${showItems.length} ve show`);
  }

  if (tourItems.length > 0) {
    const titles = [...new Set(tourItems.map((item) => item.tourSchedule?.tour?.title).filter(Boolean))];
    parts.push(titles.length === 1 ? titles[0]! : `${tourItems.length} tour`);
  }

  return { text: parts.join(' - ') || 'Khong co san pham', count: totalCount };
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
  const paymentConfig = STATUS_CONFIG.payment[booking.paymentStatus as keyof typeof STATUS_CONFIG.payment];

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.01] transform">
      {/* Status accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          booking.paymentStatus === 'PAID'
            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-b from-amber-500 to-amber-600'
        }`}
      />

      <div className="pl-5 sm:pl-6 pr-4 sm:pr-6 py-4 sm:py-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
              {booking.bookingCode}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border whitespace-nowrap ${statusConfig?.color || 'bg-slate-100 text-slate-600'}`}>
              {statusConfig?.label || booking.status}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold text-white whitespace-nowrap ${paymentConfig?.color || 'bg-slate-500'}`}>
              {paymentConfig?.label || booking.paymentStatus}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg text-brand-600">{formatCurrency(booking.finalAmount)}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Customer Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate text-sm">{booking.user.fullName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Phone className="h-3.5 w-3.5" />
                {booking.user.phoneNumber}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700 line-clamp-1" title={itemsSummary}>
                {itemsSummary}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                <span className="text-slate-900">{totalQuantity}</span> san pham
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDateTime(booking.createdAt)}</span>
          </div>
          <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">
            {getRelativeTime(booking.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
});

export const RecentBookings = memo(function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span>Don hang gan day</span>
            </CardTitle>
            <CardDescription className="mt-2 text-sm">10 don hang moi nhat tren he thong</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium hidden sm:flex whitespace-nowrap bg-white hover:bg-slate-50 border-slate-300 rounded-lg">
            Xem tat ca
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!bookings?.length ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Chua co don hang nao</p>
            <p className="text-slate-500 text-sm mt-1">Cac don hang se xuat hien tai day</p>
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
