'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, User, Calendar, Trash, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del, patch } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { toast } from 'sonner';
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
}
const typeColors: Record<string, 'success' | 'warning' | 'default'> = {
  ORDER: 'success',
  PROMOTION: 'warning',
  SYSTEM: 'default',
};
export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', page],
    queryFn: () =>
      get<{
        items: Notification[];
        meta: any;
      }>(`/admin/notifications?page=${page}&limit=20`),
  });
  const markReadMutation = useMutation({
    mutationFn: (id: number) => patch(`/admin/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/admin/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Đã xóa thông báo');
    },
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trung tâm thông báo</h1>
          <p className="mt-1 text-neutral-600">Gửi và quản lý thông báo cho người dùng</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Bell className="h-4 w-4" />
          Gửi thông báo mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thông báo</CardTitle>
          <CardDescription>
            Hiển thị các thông báo đã gửi gần đây. Tổng số: {data?.meta?.total || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="rounded-xl border-2 border-dashed py-20 text-center text-neutral-500">
              <Bell className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
              Chưa có thông báo nào được gửi.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data.items.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative rounded-xl border p-5 transition-all ${notification.isRead ? 'bg-neutral-50/50' : 'bg-white shadow-sm'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                          notification.type === 'PROMOTION'
                            ? 'bg-amber-100 text-amber-600'
                            : notification.type === 'ORDER'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <Bell className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-neutral-900">{notification.title}</h3>
                          <Badge variant={typeColors[notification.type]}>{notification.type}</Badge>
                          {!notification.isRead && (
                            <Badge variant="destructive" className="animate-pulse">
                              MỚI
                            </Badge>
                          )}
                        </div>
                        <p className="mb-3 text-sm leading-relaxed text-neutral-600">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            <User className="h-3.5 w-3.5" />
                            {notification.user?.fullName || 'Tất cả'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600"
                            onClick={() => markReadMutation.mutate(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            if (window.confirm('Xóa thông báo này?'))
                              deleteMutation.mutate(notification.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <p className="text-sm text-neutral-500">
                    Trang {data.meta.page} của {data.meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.meta.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Gửi thông báo mới</DialogTitle>
            <DialogDescription>
              Thông báo sẽ được gửi qua ứng dụng và thông qua Trung tâm thông báo.
            </DialogDescription>
          </DialogHeader>
          <NotificationForm
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
