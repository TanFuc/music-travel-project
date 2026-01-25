'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Music,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Calendar,
  CreditCard,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  shows: {
    total: number;
    upcoming: number;
  };
  tours: {
    total: number;
    activeSchedules: number;
  };
  bookings: {
    total: number;
    pendingCount: number;
    totalRevenue: number;
    revenueThisMonth: number;
  };
}

interface RecentBooking {
  id: number;
  bookingCode: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
  finalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const bookingStatusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<DashboardStats>('/admin/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data doesn't need to refresh frequently
    retry: false,
  });

  const { data: recentBookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => get<{ items: RecentBooking[] }>('/admin/recent-bookings'),
    staleTime: 2 * 60 * 1000, // 2 minutes for recent bookings
    retry: false,
  });

  // Show error state if stats failed to load
  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-error-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Không thể tải dữ liệu</h3>
            <p className="text-neutral-600 mb-4">
              {(statsError as Error).message || 'Đã xảy ra lỗi khi tải thống kê dashboard'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Người dùng"
          value={stats?.users.total || 0}
          subtitle={`+${stats?.users.newThisMonth || 0} tháng này`}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          loading={statsLoading}
        />
        <StatCard
          title="Sự kiện"
          value={stats?.shows.total || 0}
          subtitle={`${stats?.shows.upcoming || 0} sắp diễn ra`}
          icon={Music}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          loading={statsLoading}
        />
        <StatCard
          title="Tour"
          value={stats?.tours.total || 0}
          subtitle={`${stats?.tours.activeSchedules || 0} lịch hoạt động`}
          icon={MapPin}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          loading={statsLoading}
        />
        <StatCard
          title="Đơn hàng"
          value={stats?.bookings.total || 0}
          subtitle={`${stats?.bookings.pendingCount || 0} chờ xử lý`}
          icon={ShoppingBag}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          loading={statsLoading}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Doanh thu tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 bg-white/20" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(stats?.bookings.revenueThisMonth || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-white/80">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">So với tháng trước</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 sm:h-10 w-32 sm:w-40" />
            ) : (
              <>
                <p className="text-2xl sm:text-3xl font-bold text-brand-600">
                  {formatCurrency(stats?.bookings.totalRevenue || 0)}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Từ {stats?.bookings.total || 0} đơn hàng
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Đơn hàng gần đây
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">5 đơn hàng mới nhất trên hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !recentBookings?.items || recentBookings.items.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">Chưa có đơn hàng nào.</div>
          ) : (
            <div className="space-y-4">
              {recentBookings.items.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">
                        #{booking.bookingCode}
                      </span>
                      <Badge variant={bookingStatusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate">
                        {booking.user.fullName}
                      </p>
                      <span className="hidden sm:inline text-neutral-400">|</span>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {booking.user.phoneNumber}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                    <p className="font-bold text-brand-600 text-sm sm:text-base">
                      {formatCurrency(booking.finalAmount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {booking.paymentStatus === 'PAID' ? 'OK' : 'Chưa TT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  loading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-neutral-500">{title}</p>
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mt-1" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold mt-1">{value.toLocaleString('vi-VN')}</p>
            )}
            <p className="text-xs text-neutral-400 mt-1 truncate">{subtitle}</p>
          </div>
          <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0', bgColor)}>
            <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
