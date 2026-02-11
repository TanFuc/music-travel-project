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
                Doanh thu thang nay
              </p>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">
                {formatCurrency(stats.bookings.revenueThisMonth)}
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>So voi thang truoc</span>
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
                Tong doanh thu
              </p>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 bg-gradient-to-r from-amber-300 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                {formatCurrency(stats.bookings.totalRevenue)}
              </p>
              <p className="text-slate-400 text-sm mt-4 font-medium">
                Tu <span className="text-white font-bold">{stats.bookings.total}</span> don hang thanh cong
              </p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Ticket className="h-10 w-10 text-amber-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
