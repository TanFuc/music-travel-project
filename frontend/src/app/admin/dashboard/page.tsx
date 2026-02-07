'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Music,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Clock,
  CreditCard,
  Ticket,
  Phone,
  User,
  Package,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  users: { total: number; newThisMonth: number };
  shows: { total: number; upcoming: number };
  tours: { total: number; activeSchedules: number };
  bookings: { total: number; pendingCount: number; totalRevenue: number; revenueThisMonth: number };
}

interface BookingItem {
  id: number;
  itemType: string;
  quantity: number;
  originalPrice: number;
  ticket?: { id: number; show?: { id: number; title: string } };
  tourSchedule?: { id: number; tour?: { id: number; title: string } };
}

interface RecentBooking {
  id: number;
  bookingCode: string;
  user: { fullName: string; phoneNumber: string };
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: BookingItem[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG = {
  booking: {
    PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
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

const STAT_CARDS_CONFIG = [
  {
    key: 'users',
    title: 'Người dùng',
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    getValue: (s: DashboardStats) => s.users.total,
    getSubtitle: (s: DashboardStats) => `+${s.users.newThisMonth} tháng này`,
  },
  {
    key: 'shows',
    title: 'Show diễn',
    icon: Music,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    getValue: (s: DashboardStats) => s.shows.total,
    getSubtitle: (s: DashboardStats) => `${s.shows.upcoming} sắp diễn`,
  },
  {
    key: 'tours',
    title: 'Tour',
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    getValue: (s: DashboardStats) => s.tours.total,
    getSubtitle: (s: DashboardStats) => `${s.tours.activeSchedules} đang mở`,
  },
  {
    key: 'bookings',
    title: 'Đơn hàng',
    icon: ShoppingBag,
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
    getValue: (s: DashboardStats) => s.bookings.total,
    getSubtitle: (s: DashboardStats) => `${s.bookings.pendingCount} chờ xử lý`,
  },
] as const;

// ============================================================================
// UTILITIES
// ============================================================================

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

function getBookingItemsSummary(items: BookingItem[]): { text: string; count: number } {
  const showItems = items.filter((item) => item.ticket?.show);
  const tourItems = items.filter((item) => item.tourSchedule?.tour);
  const parts: string[] = [];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (showItems.length > 0) {
    const titles = [...new Set(showItems.map((item) => item.ticket?.show?.title).filter(Boolean))];
    parts.push(titles.length === 1 ? titles[0]! : `${showItems.length} vé show`);
  }

  if (tourItems.length > 0) {
    const titles = [...new Set(tourItems.map((item) => item.tourSchedule?.tour?.title).filter(Boolean))];
    parts.push(titles.length === 1 ? titles[0]! : `${tourItems.length} tour`);
  }

  return { text: parts.join(' • ') || 'Không có sản phẩm', count: totalCount };
}

// ============================================================================
// COMPONENTS
// ============================================================================

const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-24 bg-slate-200 rounded"></div>
              <div className="h-3 w-32 bg-slate-100 rounded"></div>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-slate-200 flex-shrink-0"></div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100" />
      </CardContent>
    </Card>
  );
});

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  bgLight: string;
}

const StatCard = memo(function StatCard({ title, value, subtitle, icon: Icon, gradient, bgLight }: StatCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-md bg-white">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-600">{title}</p>
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{value.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                {subtitle}
              </p>
            </div>
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
        </div>
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </CardContent>
    </Card>
  );
});

const BookingCardSkeleton = memo(function BookingCardSkeleton() {
  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white animate-pulse">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-6 w-28 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-20 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-lg flex-shrink-0"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-3 w-24 bg-slate-100 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="h-3 w-40 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
});

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
                <span className="text-slate-900">{totalQuantity}</span> sản phẩm
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  usePageTitle();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<DashboardStats>('/admin/dashboard'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => get<{ items: RecentBooking[] }>('/admin/recent-bookings'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md border-0 shadow-xl bg-white">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              {(statsError as Error).message || 'Đã xảy ra lỗi khi tải thống kê. Vui lòng thử lại.'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 transition-all duration-300 text-white font-medium"
            >
              <ArrowUpRight className="h-4 w-4" />
              Tải lại trang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-white">
      <div className="space-y-6 lg:space-y-8 pb-8">
        {/* Welcome Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-50"></div>
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 text-base mt-2">Tổng quan hệ thống quản lý</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-white/50">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS_CONFIG.map((config) => (
              <StatCard
                key={config.key}
                title={config.title}
                value={stats ? config.getValue(stats) : 0}
                subtitle={stats ? config.getSubtitle(stats) : ''}
                icon={config.icon}
                gradient={config.gradient}
                bgLight={config.bgLight}
              />
            ))}
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 sm:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4" />
                  Doanh thu tháng này
                </p>
                {statsLoading ? (
                  <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse mt-2"></div>
                ) : (
                  <p className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">
                    {formatCurrency(stats?.bookings.revenueThisMonth || 0)}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>So với tháng trước</span>
                  </div>
                </div>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 sm:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-300 text-sm font-medium flex items-center gap-2 mb-2">
                  <Ticket className="h-4 w-4" />
                  Tổng doanh thu
                </p>
                {statsLoading ? (
                  <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse mt-2"></div>
                ) : (
                  <p className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 bg-gradient-to-r from-amber-300 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                    {formatCurrency(stats?.bookings.totalRevenue || 0)}
                  </p>
                )}
                <p className="text-slate-400 text-sm mt-4 font-medium">
                  Từ <span className="text-white font-bold">{stats?.bookings.total || 0}</span> đơn hàng thành công
                </p>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Ticket className="h-10 w-10 text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span>Đơn hàng gần đây</span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm">10 đơn hàng mới nhất trên hệ thống</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium hidden sm:flex whitespace-nowrap bg-white hover:bg-slate-50 border-slate-300 rounded-lg">
              Xem tất cả
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : !recentBookings?.items?.length ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Chưa có đơn hàng nào</p>
              <p className="text-slate-500 text-sm mt-1">Các đơn hàng sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.items.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
