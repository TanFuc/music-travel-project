'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, User, Music, Clock, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, patch } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Registration {
  id: number;
  showId: number;
  stageId: number;
  userId: number | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  performanceType: string;
  songTitle: string | null;
  artistName: string | null;
  duration: number | null;
  description: string | null;
  status: string;
  registeredAt: string;
  reviewNote: string | null;
}

const performanceTypeLabels: Record<string, string> = {
  SINGING: 'Singing',
  DANCING: 'Dancing',
  INSTRUMENT: 'Instrument',
  MAGIC: 'Magic',
  COMEDY: 'Comedy',
  OTHER: 'Other',
};

const performanceTypeIcons: Record<string, string> = {
  SINGING: '🎤',
  DANCING: '💃',
  INSTRUMENT: '🎸',
  MAGIC: '🪄',
  COMEDY: '😂',
  OTHER: '✨',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
  PERFORMED: 'default',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  PERFORMED: 'Performed',
};

export default function ShowRegistrationsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const showId = parseInt(params.id as string);
  const stageId = searchParams.get('stageId');

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Load registrations
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['performance-registrations', showId, stageId, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ showId: showId.toString() });
      if (stageId) params.append('stageId', stageId);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      return get<Registration[]>(`/admin/performance/registrations?${params}`);
    },
    enabled: !!showId,
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note?: string }) =>
      patch(`/admin/performance/registrations/${id}/review`, { status, reviewNote: note }),
    onSuccess: () => {
      toast.success('Registration updated!');
      queryClient.invalidateQueries({ queryKey: ['performance-registrations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update registration');
    },
  });

  const handleApprove = (id: number) => {
    reviewMutation.mutate({ id, status: 'APPROVED' });
  };

  const handleReject = (id: number) => {
    const note = prompt('Rejection reason (optional):');
    reviewMutation.mutate({ id, status: 'REJECTED', note: note || undefined });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/shows/${showId}/qr-codes`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Performance Registrations</h1>
          <p className="text-neutral-600">Manage audience performance registrations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PERFORMED'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'ALL' ? 'All' : statusLabels[status]}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-bold">{registrations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {registrations.filter((r) => r.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {registrations.filter((r) => r.status === 'APPROVED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {registrations.filter((r) => r.status === 'REJECTED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">Performed</p>
            <p className="text-2xl font-bold text-brand-600">
              {registrations.filter((r) => r.status === 'PERFORMED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500">No registrations found</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-2xl">
                        {performanceTypeIcons[registration.performanceType] || '🎭'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">
                            {registration.guestName || 'Anonymous'}
                          </h3>
                          <Badge variant={statusColors[registration.status]}>
                            {statusLabels[registration.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          {registration.guestPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {registration.guestPhone}
                            </span>
                          )}
                          {registration.guestEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {registration.guestEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-600">Performance Type</p>
                        <p className="font-semibold">
                          {performanceTypeLabels[registration.performanceType]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Song/Act Title</p>
                        <p className="font-semibold">{registration.songTitle || '-'}</p>
                      </div>
                      {registration.artistName && (
                        <div>
                          <p className="text-sm text-neutral-600">Original Artist</p>
                          <p className="font-semibold">{registration.artistName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-neutral-600">Duration</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(registration.duration)}
                        </p>
                      </div>
                    </div>

                    {registration.description && (
                      <div className="bg-neutral-50 p-3 rounded mb-4">
                        <p className="text-sm text-neutral-600 mb-1">Description:</p>
                        <p className="text-sm">{registration.description}</p>
                      </div>
                    )}

                    {registration.reviewNote && (
                      <div className="bg-red-50 p-3 rounded mb-4">
                        <p className="text-sm text-red-600 mb-1">Review Note:</p>
                        <p className="text-sm text-red-700">{registration.reviewNote}</p>
                      </div>
                    )}

                    <p className="text-xs text-neutral-400">
                      Registered: {formatDateTime(registration.registeredAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  {registration.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(registration.id)}
                        disabled={reviewMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(registration.id)}
                        disabled={reviewMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
