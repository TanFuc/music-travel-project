'use client';
import { useQuery } from '@tanstack/react-query';
import { BannerForm } from '@/components/admin/BannerForm';
import { get } from '@/lib/api';
import { Skeleton } from '@/components/common/LoadingSkeleton';
export default function EditBannerPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { data: banner, isLoading } = useQuery({
    queryKey: ['admin-banner', params.id],
    queryFn: () => get<any>(`/banners/admin/${params.id}`),
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chỉnh Sửa Banner</h1>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : banner ? (
        <BannerForm initialData={banner} isEdit />
      ) : (
        <div>Không tìm thấy banner</div>
      )}
    </div>
  );
}
