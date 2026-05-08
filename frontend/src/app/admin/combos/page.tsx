'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash, Edit, Star, Plus, Link, Clock } from 'lucide-react';
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
export default function AdminCombosPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-combos', page],
    queryFn: () => get<any>(`/tours?isCombo=true&page=${page}&limit=20`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success('Xóa combo thành công!');
    },
  });
  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (combo: any) => {
    setEditingItem(combo);
    setIsDialogOpen(true);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-amber-600 sm:text-2xl">Quản lý Siêu Combo</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            Kết hợp Tour du lịch sinh thái với các Đêm nhạc (Eco-Music Combo)
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full gap-2 bg-amber-600 hover:bg-amber-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tạo combo mới
        </Button>
      </div>

      <Card className="border-amber-100 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách Combo</CardTitle>
          <CardDescription>
            Tổng cộng: {data?.meta?.total || 0} combo đang hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !data?.items?.length ? (
            <div className="rounded-lg border-2 border-dashed border-amber-200 py-12 text-center text-neutral-500">
              Chưa có combo nào. Nhấn "Tạo combo mới" để thiết lập gói dịch vụ.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((tour: any) => (
                <div
                  key={tour.id}
                  className="group flex flex-col justify-between rounded-xl border border-amber-100 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-lg"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-400">Giá trọn gói</p>
                        <p className="font-bold text-amber-600">
                          {formatCurrency(tour.minPrice || 0)}
                        </p>
                      </div>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-neutral-900 group-hover:text-amber-700">
                      {tour.title}
                    </h3>

                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                      <Link className="h-3 w-3" />
                      {tour.linkedShowId
                        ? `Gắn với Show ID: #${tour.linkedShowId}`
                        : 'Chưa liên kết Show'}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tour.duration || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 border-t border-amber-50 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => handleEdit(tour)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa combo này?'))
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
            <DialogTitle>{editingItem ? 'Cập nhật Combo' : 'Tạo Combo Mới'}</DialogTitle>
            <DialogDescription>
              Thiết lập gói Combo bao gồm lịch trình tour và vé xem show diễn âm nhạc.
            </DialogDescription>
          </DialogHeader>
          <TourForm
            isCombo={true}
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
