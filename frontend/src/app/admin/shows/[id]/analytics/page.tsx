'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { formatDateTime } from '@/lib/utils';
import { Link } from '@/components/common/Link';
import {
  BarChart3,
  Users,
  Ticket,
  Clock,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  QrCode,
  Keyboard,
  Mic2,
  Music,
  Guitar,
  Sparkles,
  Laugh,
  HelpCircle,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react';

interface ShowAnalytics {
  showId: number;
  showTitle: string;
  performTime: string;
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  performedRegistrations: number;
  cancelledRegistrations: number;
  noShowRate: number;
  maxCapacity: number | null;
  currentAttendance: number;
  attendancePercentage: number | null;
  totalVerifications: number;
  qrScanVerifications: number;
  manualEntryVerifications: number;
  totalActivities: number;
  activityBreakdown: Record<string, number>;
  registrationsOverTime: Array<{ date: string; count: number }>;
  verificationsOverTime: Array<{ time: string; count: number }>;
  averagePerformanceDuration: number | null;
  mostPopularPerformanceTypes: Array<{ type: string; count: number }>;
}

const getPerformanceTypeIcon = (type: string) => {
  switch (type) {
    case 'SINGING':
      return <Mic2 className="h-4 w-4" />;
    case 'DANCING':
      return <Music className="h-4 w-4" />;
    case 'INSTRUMENT':
      return <Guitar className="h-4 w-4" />;
    case 'MAGIC':
      return <Sparkles className="h-4 w-4" />;
    case 'COMEDY':
      return <Laugh className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const getPerformanceTypeName = (type: string) => {
  switch (type) {
    case 'SINGING':
      return 'Hát';
    case 'DANCING':
      return 'Nhảy';
    case 'INSTRUMENT':
      return 'Nhạc cụ';
    case 'MAGIC':
      return 'Ảo thuật';
    case 'COMEDY':
      return 'Hài';
    default:
      return 'Khác';
  }
};

export default function ShowAnalyticsPage({ params }: { params: { id: string } }) {
  const showId = parseInt(params.id);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['show-analytics', showId],
    queryFn: () => get<ShowAnalytics>(`/admin/shows/${showId}/analytics`),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getCapacityColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phân Tích & Báo Cáo</h1>
          <p className="text-neutral-600 flex items-center gap-2">
            {analytics ? (
              <>
                {analytics.showTitle}
                <Badge variant="outline" className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDateTime(analytics.performTime)}
                </Badge>
              </>
            ) : (
              'Đang tải...'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/shows/${showId}/check-in`}>
            <Button variant="outline">
              <Ticket className="h-4 w-4 mr-2" />
              Check-in
            </Button>
          </Link>
          <Link href={`/admin/shows/${showId}/activity-log`}>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Nhật ký
            </Button>
          </Link>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Attendance */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <Badge
                    variant={
                      analytics.attendancePercentage && analytics.attendancePercentage >= 75
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {analytics.attendancePercentage !== null
                      ? `${analytics.attendancePercentage}%`
                      : 'N/A'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{analytics.currentAttendance}</p>
                <p className="text-sm text-neutral-600">
                  Lượng khán giả{' '}
                  {analytics.maxCapacity && <span>/ {analytics.maxCapacity} max</span>}
                </p>
                {analytics.maxCapacity && (
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCapacityColor(analytics.attendancePercentage)} transition-all`}
                      style={{ width: `${Math.min(analytics.attendancePercentage || 0, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Registrations */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Mic2 className="h-8 w-8 text-purple-500" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{analytics.totalRegistrations}</p>
                <p className="text-sm text-neutral-600">Đăng ký biểu diễn</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {analytics.pendingRegistrations} chờ
                  </Badge>
                  <Badge variant="default" className="text-xs bg-green-600">
                    {analytics.performedRegistrations} xong
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Verifications */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{analytics.totalVerifications}</p>
                <p className="text-sm text-neutral-600">Xác thực vé</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    {analytics.qrScanVerifications}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Keyboard className="h-3 w-3" />
                    {analytics.manualEntryVerifications}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* No-Show Rate */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <Badge
                    variant={analytics.noShowRate > 20 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {analytics.noShowRate > 20 ? 'Cao' : 'Bình thường'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{analytics.noShowRate}%</p>
                <p className="text-sm text-neutral-600">Tỷ lệ vắng mặt</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {analytics.cancelledRegistrations} đăng ký bị hủy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5" />
                  Trạng thái đăng ký
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Chờ duyệt', value: analytics.pendingRegistrations, color: 'bg-yellow-500' },
                    { label: 'Đã duyệt', value: analytics.approvedRegistrations, color: 'bg-blue-500' },
                    { label: 'Đã biểu diễn', value: analytics.performedRegistrations, color: 'bg-green-500' },
                    { label: 'Đã hủy', value: analytics.cancelledRegistrations, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="font-bold">{item.value}</span>
                      <span className="text-xs text-neutral-500 w-12 text-right">
                        {analytics.totalRegistrations > 0
                          ? Math.round((item.value / analytics.totalRegistrations) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  ))}
                </div>

                {/* Visual Bar */}
                <div className="mt-4 h-4 rounded-full overflow-hidden flex">
                  {analytics.totalRegistrations > 0 && (
                    <>
                      <div
                        className="bg-yellow-500"
                        style={{
                          width: `${(analytics.pendingRegistrations / analytics.totalRegistrations) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-blue-500"
                        style={{
                          width: `${(analytics.approvedRegistrations / analytics.totalRegistrations) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${(analytics.performedRegistrations / analytics.totalRegistrations) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-red-500"
                        style={{
                          width: `${(analytics.cancelledRegistrations / analytics.totalRegistrations) * 100}%`,
                        }}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Loại tiết mục phổ biến
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.mostPopularPerformanceTypes.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.mostPopularPerformanceTypes.map((pt, index) => {
                      const maxCount = analytics.mostPopularPerformanceTypes[0]?.count || 1;
                      const percentage = (pt.count / maxCount) * 100;

                      return (
                        <div key={pt.type} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-neutral-400">#{index + 1}</span>
                              {getPerformanceTypeIcon(pt.type)}
                              <span className="font-medium">{getPerformanceTypeName(pt.type)}</span>
                            </div>
                            <Badge variant="secondary">{pt.count}</Badge>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {analytics.averagePerformanceDuration && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Thời lượng trung bình
                      </span>
                      <span className="font-bold">
                        {Math.round(analytics.averagePerformanceDuration / 60)} phút
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Phân tích hoạt động ({analytics.totalActivities} tổng)
              </CardTitle>
              <CardDescription>
                Tổng hợp tất cả hoạt động liên quan đến sự kiện này
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {Object.entries(analytics.activityBreakdown).map(([type, count]) => (
                  <div key={type} className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-neutral-600 truncate">
                      {type === 'REGISTRATION' && 'Đăng ký'}
                      {type === 'CANCELLATION' && 'Hủy'}
                      {type === 'STATUS_CHANGE' && 'Đổi TT'}
                      {type === 'TICKET_VERIFICATION' && 'Xác thực'}
                      {type === 'ADMIN_ACTION' && 'Admin'}
                      {type === 'QUEUE_REORDER' && 'Sắp xếp'}
                      {type === 'CHECK_IN' && 'Check-in'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Registration Timeline (Simple) */}
          {analytics.registrationsOverTime.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Đăng ký theo ngày (7 ngày gần nhất)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {analytics.registrationsOverTime.map((item) => {
                    const maxCount = Math.max(
                      ...analytics.registrationsOverTime.map((i) => i.count),
                      1
                    );
                    const height = (item.count / maxCount) * 100;

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-bold mb-1">{item.count}</span>
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                        <span className="text-xs text-neutral-500 mt-1">
                          {new Date(item.date).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/admin/shows/${showId}/registrations`}>
              <Card className="hover:bg-neutral-50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quản lý đăng ký</p>
                    <p className="text-sm text-neutral-500">Xem và duyệt tiết mục</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-400" />
                </CardContent>
              </Card>
            </Link>

            <Link href={`/admin/shows/${showId}/check-in`}>
              <Card className="hover:bg-neutral-50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quét vé Check-in</p>
                    <p className="text-sm text-neutral-500">Xác thực vé khán giả</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-400" />
                </CardContent>
              </Card>
            </Link>

            <Link href={`/admin/shows/${showId}/activity-log`}>
              <Card className="hover:bg-neutral-50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nhật ký hoạt động</p>
                    <p className="text-sm text-neutral-500">Xem lịch sử chi tiết</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-400" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Không thể tải dữ liệu phân tích</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}
