'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { formatDateTime } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Download,
  RefreshCw,
  User,
  Ticket,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Shield,
  ListOrdered,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ActivityLog {
  id: number;
  activityType: string;
  actor: {
    id: number;
    name: string;
    role: string;
  } | null;
  targetId: number | null;
  targetType: string | null;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

interface ActivityLogsResponse {
  show: {
    id: number;
    title: string;
  };
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ActivitySummary {
  showId: number;
  showTitle: string;
  totalActivities: number;
  breakdown: Record<string, number>;
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    actor: string;
    createdAt: string;
  }>;
}

const ACTIVITY_TYPES = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'REGISTRATION', label: 'Đăng ký' },
  { value: 'CANCELLATION', label: 'Hủy đăng ký' },
  { value: 'STATUS_CHANGE', label: 'Đổi trạng thái' },
  { value: 'TICKET_VERIFICATION', label: 'Xác thực vé' },
  { value: 'ADMIN_ACTION', label: 'Hành động Admin' },
  { value: 'QUEUE_REORDER', label: 'Sắp xếp lại' },
  { value: 'CHECK_IN', label: 'Check-in' },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'REGISTRATION':
      return <ClipboardList className="h-4 w-4 text-blue-500" />;
    case 'CANCELLATION':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'STATUS_CHANGE':
      return <ArrowLeftRight className="h-4 w-4 text-orange-500" />;
    case 'TICKET_VERIFICATION':
      return <Ticket className="h-4 w-4 text-green-500" />;
    case 'ADMIN_ACTION':
      return <Shield className="h-4 w-4 text-purple-500" />;
    case 'QUEUE_REORDER':
      return <ListOrdered className="h-4 w-4 text-yellow-500" />;
    case 'CHECK_IN':
      return <LogIn className="h-4 w-4 text-teal-500" />;
    default:
      return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'REGISTRATION':
      return 'bg-blue-100 text-blue-700';
    case 'CANCELLATION':
      return 'bg-red-100 text-red-700';
    case 'STATUS_CHANGE':
      return 'bg-orange-100 text-orange-700';
    case 'TICKET_VERIFICATION':
      return 'bg-green-100 text-green-700';
    case 'ADMIN_ACTION':
      return 'bg-purple-100 text-purple-700';
    case 'QUEUE_REORDER':
      return 'bg-yellow-100 text-yellow-700';
    case 'CHECK_IN':
      return 'bg-teal-100 text-teal-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function ShowActivityLogPage({ params }: { params: { id: string } }) {
  const showId = parseInt(params.id);
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('ALL');
  const [page, setPage] = useState(1);

  // Fetch activity logs
  const { data: logsData, isLoading: isLoadingLogs, refetch } = useQuery({
    queryKey: ['show-activity-logs', showId, activityType, search, page],
    queryFn: () =>
      get<ActivityLogsResponse>(
        `/admin/shows/${showId}/activity-log?${new URLSearchParams({
          ...(activityType !== 'ALL' && { activityType }),
          ...(search && { search }),
          page: page.toString(),
          limit: '20',
        })}`
      ),
  });

  // Fetch activity summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['show-activity-summary', showId],
    queryFn: () => get<ActivitySummary>(`/admin/shows/${showId}/activity-summary`),
  });

  // Export activity logs
  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/v1/admin/shows/${showId}/activity-log/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nhật Ký Hoạt Động</h1>
          <p className="text-neutral-600">
            {logsData?.show?.title || summary?.showTitle || 'Đang tải...'} - Theo dõi tất cả hoạt động liên quan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {ACTIVITY_TYPES.filter((t) => t.value !== 'ALL').map((type) => (
          <Card
            key={type.value}
            className={`cursor-pointer transition-all ${activityType === type.value ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActivityType(activityType === type.value ? 'ALL' : type.value)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {getActivityIcon(type.value)}
                <span className="text-xs font-medium truncate">{type.label}</span>
              </div>
              <p className="text-2xl font-bold">
                {isLoadingSummary ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  summary?.breakdown?.[type.value] || 0
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Tìm kiếm trong mô tả..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={activityType}
              onValueChange={(value) => {
                setActivityType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.value !== 'ALL' && getActivityIcon(type.value)}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Nhật ký ({logsData?.pagination?.total || 0} hoạt động)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !logsData?.data?.length ? (
            <div className="text-center py-12 text-neutral-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy hoạt động nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logsData.data.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(log.activityType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          variant="secondary"
                          className={`mb-1 ${getActivityColor(log.activityType)}`}
                        >
                          {ACTIVITY_TYPES.find((t) => t.value === log.activityType)?.label ||
                            log.activityType}
                        </Badge>
                        <p className="text-sm">{log.description}</p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-1">
                            <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
                              Xem chi tiết
                            </summary>
                            <pre className="mt-1 p-2 bg-neutral-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="text-right text-sm text-neutral-500 whitespace-nowrap">
                        <p>{formatDateTime(log.createdAt)}</p>
                      </div>
                    </div>
                    {log.actor && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                        <User className="h-3 w-3" />
                        <span>
                          {log.actor.name} ({log.actor.role})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {logsData?.pagination && logsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-neutral-600">
                Trang {logsData.pagination.page} / {logsData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(logsData.pagination.totalPages, p + 1))}
                  disabled={page === logsData.pagination.totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
