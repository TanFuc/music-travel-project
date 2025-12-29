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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<DashboardStats>('/admin/stats'),
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => get<{ items: RecentBooking[] }>('/admin/bookings?limit=5&sort=-createdAt'),
  });

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Nguoi dung"
          value={stats?.users.total || 0}
          subtitle={`+${stats?.users.newThisMonth || 0} thang nay`}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          loading={statsLoading}
        />
        <StatCard
          title="Su kien"
          value={stats?.shows.total || 0}
          subtitle={`${stats?.shows.upcoming || 0} sap dien ra`}
          icon={Music}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          loading={statsLoading}
        />
        <StatCard
          title="Tour"
          value={stats?.tours.total || 0}
          subtitle={`${stats?.tours.activeSchedules || 0} lich hoat dong`}
          icon={MapPin}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          loading={statsLoading}
        />
        <StatCard
          title="Don hang"
          value={stats?.bookings.total || 0}
          subtitle={`${stats?.bookings.pendingCount || 0} cho xu ly`}
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
              Doanh thu thang nay
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
                  <span className="text-sm">So voi thang truoc</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tong doanh thu
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
                  Tu {stats?.bookings.total || 0} don hang
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
            Don hang gan day
          </CardTitle>
          <CardDescription>5 don hang moi nhat</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !recentBookings?.items || recentBookings.items.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">Chua co don hang nao.</div>
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
                      {booking.paymentStatus === 'PAID' ? 'Da thanh toan' : 'Chua thanh toan'}
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
