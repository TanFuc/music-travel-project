'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Trash, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { TourForm } from '@/components/admin/TourForm';
import { toast } from 'sonner';
export default function AdminToursPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tours', page],
    queryFn: () => get<any>(`/tours?isCombo=false&page=${page}&limit=20`),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Xóa thành công!');
    },
  });
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Quản lý Tour Sinh Thái (isCombo = false)
          </h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            {data?.meta?.total || 0} tour
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="w-full gap-2 sm:w-auto">
          <MapPin className="h-4 w-4" />
          Tạo tour mới
        </Button>
      </div>

      {(isCreating || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Sửa Tour' : 'Thêm Tour Mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <TourForm
              isCombo={false}
              initialData={editingItem}
              onSuccess={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
              onCancel={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Danh sách tour</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có tour nào.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.items.map((tour: any) => (
                <div
                  key={tour.id}
                  className="flex flex-col justify-between rounded-lg border p-4 hover:shadow-md"
                >
                  <div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{tour.title}</h3>
                    <p className="text-sm text-gray-500">Giá: {tour.minPrice || 0} VNĐ</p>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" /> {tour.duration || 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4 flex auto-cols-auto gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingItem(tour)}>
                      <Edit className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Xóa tour này?')) deleteMutation.mutate(tour.id);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
