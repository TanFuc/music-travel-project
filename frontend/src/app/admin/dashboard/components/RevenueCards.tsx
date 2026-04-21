'use client';
import { memo } from 'react';
import { CreditCard, Ticket, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/lib/api-server';
interface RevenueCardsProps {
  stats: DashboardStats;
}
export const RevenueCards = memo(function RevenueCards({ stats }: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardContent className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <CreditCard className="h-4 w-4" />
                Doanh thu tháng này
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrency(stats.bookings.revenueThisMonth)}
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-white/20 pt-4">
                <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>So với tháng trước</span>
                </div>
              </div>
            </div>
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md">
              <CreditCard className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardContent className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Ticket className="h-4 w-4" />
                Tổng doanh thu
              </p>
              <p className="mt-2 bg-gradient-to-r from-amber-300 via-orange-300 to-orange-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                {formatCurrency(stats.bookings.totalRevenue)}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-400">
                Từ <span className="font-bold text-white">{stats.bookings.total}</span> đơn hàng
                thành công
              </p>
            </div>
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md">
              <Ticket className="h-10 w-10 text-amber-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
