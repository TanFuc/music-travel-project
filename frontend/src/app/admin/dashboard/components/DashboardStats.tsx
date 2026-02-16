'use client';

import { memo } from 'react';
import { Users, Music, MapPin, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardStats as DashboardStatsType } from '@/lib/api-server';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

const STAT_CARDS_CONFIG = [
  {
    key: 'users',
    title: 'Người dùng',
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    getValue: (s: DashboardStatsType) => s.users.total,
    getSubtitle: (s: DashboardStatsType) => `+${s.users.newThisMonth} tháng này`,
  },
  {
    key: 'shows',
    title: 'Show diễn',
    icon: Music,
    gradient: 'from-violet-500 to-purple-600',
    getValue: (s: DashboardStatsType) => s.shows.total,
    getSubtitle: (s: DashboardStatsType) => `${s.shows.upcoming} sắp diễn`,
  },
  {
    key: 'tours',
    title: 'Tour',
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-600',
    getValue: (s: DashboardStatsType) => s.tours.total,
    getSubtitle: (s: DashboardStatsType) => `${s.tours.activeSchedules} đang mở`,
  },
  {
    key: 'bookings',
    title: 'Đơn hàng',
    icon: ShoppingBag,
    gradient: 'from-orange-500 to-amber-600',
    getValue: (s: DashboardStatsType) => s.bookings.total,
    getSubtitle: (s: DashboardStatsType) => `${s.bookings.pendingCount} chờ xử lý`,
  },
] as const;

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
}

const StatCard = memo(function StatCard({ title, value, subtitle, icon: Icon, gradient }: StatCardProps) {
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

export const DashboardStats = memo(function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {STAT_CARDS_CONFIG.map((config) => (
        <StatCard
          key={config.key}
          title={config.title}
          value={config.getValue(stats)}
          subtitle={config.getSubtitle(stats)}
          icon={config.icon}
          gradient={config.gradient}
        />
      ))}
    </div>
  );
});
