'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Link } from '@/components/common/Link';
import {
  ArrowLeft,
  Music,
  Clock,
  Users,
  Mic2,
  RefreshCw,
  User,
  ListMusic,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useState, useEffect } from 'react';

interface QueueItem {
  id: number;
  queueNumber: number;
  songTitle: string | null;
  artistName: string | null;
  performanceType: string;
  duration: number | null;
  status: string;
  performerName: string;
  estimatedWaitMinutes: number;
  isCurrentlyPerforming: boolean;
}

interface QueueData {
  show: {
    id: number;
    title: string;
    performTime: string;
    stage: {
      name: string;
      location: { name: string };
    };
  };
  totalRegistrations: number;
  currentPerformer: {
    queueNumber: number;
    songTitle: string | null;
  } | null;
  queue: QueueItem[];
}

const performanceTypeLabels: Record<string, string> = {
  SINGING: 'Ca hát',
  DANCING: 'Nhảy',
  INSTRUMENT: 'Nhạc cụ',
  MAGIC: 'Ảo thuật',
  COMEDY: 'Hài kịch',
  OTHER: 'Khác',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PERFORMED: 'Đã biểu diễn',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
};

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  PERFORMED: 'secondary',
  CANCELLED: 'destructive',
  REJECTED: 'destructive',
};

export default function PerformanceQueuePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  // Fetch show ID from slug first
  const { data: showData, isLoading: isLoadingShow } = useQuery({
    queryKey: ['show-by-slug', slug],
    queryFn: () => get<{ id: number; title: string }>(`/shows/by-slug/${slug}`),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch queue data
  const {
    data: queueData,
    isLoading: isLoadingQueue,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['performance-queue', showData?.id],
    queryFn: () => get<QueueData>(`/performance/shows/${showData?.id}/queue`),
    enabled: !!showData?.id,
    refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh every 10 seconds
    staleTime: 5000,
  });

  usePageTitle(
    queueData?.show?.title ? `Danh sách biểu diễn - ${queueData.show.title}` : 'Danh sách biểu diễn',
    isLoadingShow || isLoadingQueue
  );

  // Filter queue items
  const filteredQueue = queueData?.queue?.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return item.status === 'PENDING' || item.status === 'APPROVED';
    if (filter === 'completed') return item.status === 'PERFORMED';
    return true;
  });

  // Find current performer
  const currentPerformer = queueData?.queue?.find((item) => item.isCurrentlyPerforming);

  // Find next up performers (next 3 after current)
  const upcomingPerformers = queueData?.queue
    ?.filter((item) => item.status === 'PENDING' || item.status === 'APPROVED')
    .slice(0, 5);

  if (isLoadingShow || isLoadingQueue) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!queueData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <p className="text-neutral-500">Không tìm thấy thông tin show diễn</p>
        <Link href="/shows">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách show
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/shows/${slug}`} className="inline-flex items-center text-sm text-brand-600 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại chi tiết show
          </Link>
          <h1 className="text-2xl font-bold">{queueData.show.title}</h1>
          <p className="text-neutral-600 mt-1">
            {queueData.show.stage.name} - {queueData.show.stage.location.name}
          </p>
          <p className="text-sm text-neutral-500">{formatDateTime(queueData.show.performTime)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Tự động' : 'Thủ công'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Current Performer Highlight */}
      {currentPerformer && (
        <Card className="mb-6 border-brand-500 bg-brand-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic2 className="h-5 w-5 text-brand-600" />
              Đang biểu diễn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-600">#{currentPerformer.queueNumber}</p>
                <p className="text-lg font-semibold">{currentPerformer.performerName}</p>
                <p className="text-neutral-600">{currentPerformer.songTitle || 'Chưa có thông tin bài hát'}</p>
              </div>
              <Badge variant="success" className="text-lg px-4 py-2">
                LIVE
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 mx-auto text-brand-600 mb-2" />
            <p className="text-2xl font-bold">{queueData.totalRegistrations}</p>
            <p className="text-sm text-neutral-500">Tổng đăng ký</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <ListMusic className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">
              {queueData.queue.filter((q) => q.status === 'PENDING' || q.status === 'APPROVED').length}
            </p>
            <p className="text-sm text-neutral-500">Đang chờ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold">
              ~{upcomingPerformers?.[0]?.estimatedWaitMinutes || 0}
            </p>
            <p className="text-sm text-neutral-500">Phút chờ tiếp</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Up Section */}
      {upcomingPerformers && upcomingPerformers.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPerformers.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-neutral-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                    {item.queueNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.performerName}</p>
                    <p className="text-sm text-neutral-600">{item.songTitle || 'Chưa có thông tin'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusColors[item.status] || 'default'}>
                      {performanceTypeLabels[item.performanceType] || item.performanceType}
                    </Badge>
                    <p className="text-xs text-neutral-500 mt-1">~{item.estimatedWaitMinutes} phút</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Đang chờ
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Đã biểu diễn
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tất cả
        </Button>
      </div>

      {/* Full Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Danh sách biểu diễn ({filteredQueue?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredQueue?.length ? (
            <p className="text-center py-8 text-neutral-500">Chưa có đăng ký biểu diễn nào</p>
          ) : (
            <div className="space-y-2">
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    item.isCurrentlyPerforming
                      ? 'border-brand-500 bg-brand-50'
                      : item.status === 'PERFORMED'
                      ? 'bg-neutral-50 opacity-60'
                      : 'hover:border-brand-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      item.isCurrentlyPerforming
                        ? 'bg-brand-600 text-white'
                        : item.status === 'PERFORMED'
                        ? 'bg-neutral-300 text-neutral-600'
                        : 'bg-brand-100 text-brand-600'
                    }`}
                  >
                    {item.queueNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400" />
                      <p className="font-semibold truncate">{item.performerName}</p>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">
                      {item.songTitle || 'Chưa có thông tin bài hát'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant={statusColors[item.status] || 'default'}>
                      {item.isCurrentlyPerforming ? 'Đang hát' : statusLabels[item.status] || item.status}
                    </Badge>
                    {item.duration && (
                      <p className="text-xs text-neutral-500 mt-1">{item.duration} phút</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register CTA */}
      <div className="mt-6 text-center">
        <Link href={`/register-performance?showId=${showData?.id}`}>
          <Button size="lg" className="gap-2">
            <Mic2 className="h-5 w-5" />
            Đăng ký biểu diễn
          </Button>
        </Link>
      </div>
    </div>
  );
}
