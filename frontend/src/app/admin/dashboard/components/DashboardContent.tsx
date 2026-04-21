'use client';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardStats } from './DashboardStats';
import { RevenueCards } from './RevenueCards';
import { RecentBookings } from './RecentBookings';
import { DashboardHeader } from './DashboardHeader';
import { StatsSkeleton, RevenueSkeleton, BookingsSkeleton } from './Skeletons';
import type { DashboardStats as DashboardStatsType, RecentBooking } from '@/lib/api-server';
export function DashboardContent() {
  usePageTitle();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<DashboardStatsType>('/admin/dashboard'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () =>
      get<{
        items: RecentBooking[];
      }>('/admin/recent-bookings'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
  if (statsError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="max-w-md border-0 bg-white shadow-xl">
          <CardContent className="pb-8 pt-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">Không thể tải dữ liệu</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              {(statsError as Error).message || 'Đã xảy ra lỗi khi tải thống kê. Vui lòng thử lại.'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="gap-2 bg-gradient-to-r from-brand-500 to-brand-600 font-medium text-white transition-all duration-300 hover:from-brand-600 hover:to-brand-700"
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
      <div className="space-y-6 pb-8 lg:space-y-8">
        <DashboardHeader />

        {statsLoading ? <StatsSkeleton /> : stats ? <DashboardStats stats={stats} /> : null}

        {statsLoading ? <RevenueSkeleton /> : stats ? <RevenueCards stats={stats} /> : null}

        {bookingsLoading ? (
          <BookingsSkeleton />
        ) : (
          <RecentBookings bookings={recentBookings?.items || []} />
        )}
      </div>
    </div>
  );
}
