'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';
import { Check, X, Clock, Mic2, Music, User } from 'lucide-react';

interface Registration {
  id: number;
  guestName: string;
  guestPhone: string;
  songTitle: string;
  performanceType: string;
  duration: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'PERFORMED';
  registeredAt: string;
  slot?: {
    slotOrder: number;
    startTime: string;
    endTime: string;
  };
}

export default function ShowRegistrationsPage({ params }: { params: { id: string } }) {
  const showId = parseInt(params.id);
  const queryClient = useQueryClient();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['admin-registrations', showId],
    queryFn: () => get<Registration[]>(`/admin/performance/registrations?showId=${showId}`),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
        patch(`/admin/performance/registrations/${id}/review`, { status, reviewNote: 'Reviewed by admin' }),
    onSuccess: () => {
        toast.success('Cập nhật trạng thái thành công');
        queryClient.invalidateQueries({ queryKey: ['admin-registrations', showId] });
    },
    onError: () => {
        toast.error('Có lỗi xảy ra');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'default'; // Black/Green usually
        case 'PENDING': return 'secondary'; // Gray
        case 'REJECTED': return 'destructive'; // Red
        case 'PERFORMED': return 'outline';
        default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Danh Sách Đăng Ký Biểu Diễn</h1>
            <p className="text-neutral-600">Quản lý các tiết mục đăng ký cho sự kiện</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Danh sách tiết mục ({registrations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
            ) : !registrations?.length ? (
                <div className="text-center py-12 text-neutral-500">Chưa có đăng ký nào.</div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div key={reg.id} className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-lg">{reg.songTitle}</h3>
                                    <Badge variant={getStatusColor(reg.status)}>
                                        {reg.status}
                                    </Badge>
                                    <Badge variant="outline" className="flex gap-1 items-center">
                                        <Mic2 className="h-3 w-3" />
                                        {reg.performanceType}
                                    </Badge>
                                    {reg.slot && (
                                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                                            #{reg.slot.slotOrder}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-600">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{reg.guestName}</span> 
                                        {reg.guestPhone && <span className="text-neutral-400">({reg.guestPhone})</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {reg.duration} giây
                                        <span className="text-neutral-300">|</span>
                                        {formatDateTime(reg.registeredAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {reg.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="default" 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => reviewMutation.mutate({ id: reg.id, status: 'APPROVED' })}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Duyệt
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => reviewMutation.mutate({ id: reg.id, status: 'REJECTED' })}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Từ chối
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
