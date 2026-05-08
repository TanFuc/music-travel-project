'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Trash, Edit, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { TourForm } from '@/components/admin/TourForm';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
export default function AdminToursPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tours', page],
    queryFn: () => get<any>(`/tours?isCombo=false&page=${page}&limit=20`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Xóa tour thành công!');
    },
  });
  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (tour: any) => {
    setEditingItem(tour);
    setIsDialogOpen(true);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý Tour Sinh Thái</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            Thiết kế và quản lý các tour du lịch sinh thái
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Tạo tour mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Danh sách Tour</CardTitle>
              <CardDescription>Tổng cộng: {data?.meta?.total || 0} tour</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !data?.items?.length ? (
            <div className="rounded-lg border-2 border-dashed py-12 text-center text-neutral-500">
              Chưa có tour nào. Nhấn "Tạo tour mới" để bắt đầu.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((tour: any) => (
                <div
                  key={tour.id}
                  className="group flex flex-col justify-between rounded-xl border bg-white p-5 transition-all hover:border-brand-200 hover:shadow-lg"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-400">Giá từ</p>
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(tour.minPrice || 0)}
                        </p>
                      </div>
                    </div>
                    <h3 className="mb-4 line-clamp-2 text-lg font-bold text-neutral-900 group-hover:text-brand-600">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tour.duration || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(tour)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa tour này?'))
                          deleteMutation.mutate(tour.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Cập nhật Tour' : 'Thêm Tour Mới'}</DialogTitle>
            <DialogDescription>
              Cung cấp các thông tin chi tiết về hành trình, giá cả và mô tả tour.
            </DialogDescription>
          </DialogHeader>
          <TourForm
            isCombo={false}
            initialData={editingItem}
            onSuccess={() => {
              setIsDialogOpen(false);
              setEditingItem(null);
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
