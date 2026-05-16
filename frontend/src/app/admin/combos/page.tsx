'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash, Edit, Plus, Music, MapPin, Calendar, Package, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    queryFn: () => get<any>(`/combos?page=${page}&limit=20`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/combos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success('Xóa combo thành công!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi khi xóa combo');
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
  const handleDelete = (combo: any) => {
    if (window.confirm(`Bạn có chắc muốn xóa combo "${combo.title}"?`)) {
      deleteMutation.mutate(combo.id);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-amber-600 sm:text-2xl">Quản lý Siêu Combo</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gói kết hợp Tour du lịch sinh thái + Đêm nhạc Live. Mỗi combo tự động liên kết với một
            Show cụ thể.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full gap-2 bg-amber-600 hover:bg-amber-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tạo Combo mới
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{data?.meta?.total || 0}</p>
          <p className="text-xs text-amber-700">Tổng combo</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">
            {data?.items?.filter((c: any) => c.linkedShowId)?.length || 0}
          </p>
          <p className="text-xs text-indigo-700">Đã liên kết Show</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {data?.items?.filter((c: any) => c.nextSchedule)?.length || 0}
          </p>
          <p className="text-xs text-emerald-700">Có lịch sắp tới</p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {data?.items?.filter((c: any) => c.minPrice)?.length || 0}
          </p>
          <p className="text-xs text-purple-700">Đã cấu hình giá</p>
        </div>
      </div>

      <Card className="border-amber-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base sm:text-lg">Danh sách Combo</CardTitle>
          </div>
          <CardDescription>
            Mỗi Combo là sự kết hợp giữa một hành trình Tour sinh thái và một đêm nhạc sống động.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-52 w-full" />
            </div>
          ) : !data?.items?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 py-16 text-center">
              <Package className="mb-4 h-12 w-12 text-amber-300" />
              <p className="font-medium text-neutral-600">Chưa có Combo nào</p>
              <p className="mt-1 text-sm text-neutral-400">
                Nhấn &ldquo;Tạo Combo mới&rdquo; để tạo gói kết hợp Tour & Show đầu tiên.
              </p>
              <Button onClick={handleCreate} className="mt-4 gap-2 bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4" />
                Tạo Combo đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((combo: any) => (
                <div
                  key={combo.id}
                  className="group flex flex-col justify-between rounded-xl border border-amber-100 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 p-2">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-right">
                        {combo.minPrice ? (
                          <>
                            <p className="text-xs text-neutral-400">Giá từ</p>
                            <p className="font-bold text-amber-600">
                              {formatCurrency(combo.minPrice)}
                            </p>
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-neutral-200 text-[10px] text-neutral-400"
                          >
                            Chưa có giá
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover:text-amber-700">
                      {combo.title}
                    </h3>

                    <div
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                        combo.linkedShow
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400'
                      }`}
                    >
                      <Music className="h-3.5 w-3.5 flex-shrink-0" />
                      {combo.linkedShow ? (
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{combo.linkedShow.title}</p>
                          {combo.linkedShow.stage?.name && (
                            <p className="text-[10px] text-indigo-500">
                              {combo.linkedShow.stage.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span>Chưa liên kết Show diễn</span>
                      )}
                    </div>

                    {(combo.departureLoc || combo.destinationLoc) && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{combo.departureLoc?.name || '?'}</span>
                        <span className="text-neutral-300">→</span>
                        <span>{combo.destinationLoc?.name || '?'}</span>
                      </div>
                    )}

                    {combo.nextSchedule && (
                      <div className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Lịch gần nhất:{' '}
                          {new Date(combo.nextSchedule.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-amber-50 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => handleEdit(combo)}
                    >
                      <Edit className="mr-1.5 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(combo)}
                      disabled={deleteMutation.isPending}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <Package className="h-5 w-5" />
              {editingItem ? 'Cập nhật Combo' : 'Tạo Combo Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Chỉnh sửa thông tin gói Combo. Thay đổi liên kết Show sẽ cập nhật tự động trên trang web.'
                : 'Tạo gói Combo kết hợp Tour sinh thái và Đêm nhạc Live. Bắt buộc liên kết với một Show diễn.'}
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
