'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
interface Banner {
  id: number;
  title?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  actionLink?: string;
  position: string;
  displayOrder: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
}
export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => get<Banner[]>('/banners/admin/all'),
  });
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await del(`/banners/admin/${deleteId}`);
      toast.success('Xóa banner thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    } catch {
      toast.error('Có lỗi xảy ra khi xóa banner');
    } finally {
      setDeleteId(null);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Banner</h1>
          <p className="mt-1 text-neutral-600">Quản lý các banner hiển thị trên website</p>
        </div>
        <Link href="/admin/banners/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm Banner
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Banner</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : !banners?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có banner nào.</div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex flex-col items-start gap-4 md:flex-row">
                    <div className="flex shrink-0 gap-2">
                      <div className="relative h-20 w-32 overflow-hidden rounded-md border bg-neutral-100">
                        <Image
                          src={banner.imageUrl}
                          alt="Desktop"
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 right-1 rounded bg-black/50 p-1">
                          <Monitor className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      {banner.mobileImageUrl && (
                        <div className="relative h-20 w-16 overflow-hidden rounded-md border bg-neutral-100">
                          <Image
                            src={banner.mobileImageUrl}
                            alt="Mobile"
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/50 p-1">
                            <Smartphone className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{banner.title || 'Không có tiêu đề'}</h3>
                        <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                          {banner.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                        </Badge>
                        <Badge variant="outline">{banner.position}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Thứ tự:</span> {banner.displayOrder}
                        </div>
                        {banner.actionLink && (
                          <div className="flex max-w-[300px] items-center gap-2">
                            <LinkIcon className="h-3 w-3 flex-shrink-0" />
                            <a
                              href={banner.actionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-blue-600 hover:underline"
                            >
                              {banner.actionLink}
                            </a>
                          </div>
                        )}
                        {(banner.startTime || banner.endTime) && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>
                              {banner.startTime
                                ? new Date(banner.startTime).toLocaleDateString()
                                : '...'}
                              {' - '}
                              {banner.endTime
                                ? new Date(banner.endTime).toLocaleDateString()
                                : '...'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/banners/${banner.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteId(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Banner sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
