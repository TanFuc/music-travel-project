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
    retry: 2,
    retryDelay: 1000,
  });

  const { data: recentBookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => get<{ items: RecentBooking[] }>('/admin/recent-bookings'),
    retry: 2,
    retryDelay: 1000,
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
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5" />
              Doanh thu tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-40 bg-white/20" />
            ) : (
              <>
                <p className="text-3xl font-bold">
                  {formatCurrency(stats?.bookings.revenueThisMonth || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-white/80">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">So với tháng trước</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                <p className="text-3xl font-bold text-brand-600">
                  {formatCurrency(stats?.bookings.totalRevenue || 0)}
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Từ {stats?.bookings.total || 0} đơn hàng
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Đơn hàng gần đây
          </CardTitle>
          <CardDescription>5 đơn hàng mới nhất</CardDescription>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        #{booking.bookingCode}
                      </span>
                      <Badge variant={bookingStatusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {booking.user.fullName} | {booking.user.phoneNumber}
                    </p>
                    <p className="text-xs text-neutral-400">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">
                      {formatCurrency(booking.finalAmount)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </p>
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
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value.toLocaleString('vi-VN')}</p>
            )}
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', bgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
