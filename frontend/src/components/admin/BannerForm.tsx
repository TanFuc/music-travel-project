'use client';

import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { post, patch } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';

const bannerSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().url('Vui lòng nhập URL ảnh hợp lệ'),
  mobileImageUrl: z.string().url('Vui lòng nhập URL ảnh hợp lệ').optional().or(z.literal('')),
  actionLink: z.string().optional(),
  position: z.enum(['HOME_MAIN_SLIDER', 'HOME_MID_SECTION', 'POPUP', 'SIDEBAR']),
  displayOrder: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialData?: BannerFormValues & { id?: number };
  isEdit?: boolean;
}

export function BannerForm({ initialData, isEdit }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: initialData?.title || '',
      imageUrl: initialData?.imageUrl || '',
      mobileImageUrl: initialData?.mobileImageUrl || '',
      actionLink: initialData?.actionLink || '',
      position: (initialData?.position as any) || 'HOME_MAIN_SLIDER',
      displayOrder: initialData?.displayOrder ?? 0,
      isActive: initialData?.isActive ?? true,
      startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : undefined,
      endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: BannerFormValues) => {
    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await patch(`/banners/admin/${initialData.id}`, data);
        toast.success('Cập nhật banner thành công');
      } else {
        await post('/banners/admin', data);
        toast.success('Tạo banner thành công');
      }
      router.push('/admin/banners');
      router.refresh();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Tiêu đề (Tùy chọn)</Label>
          <Input id="title" {...register('title')} placeholder="Nhập tiêu đề banner" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-2 col-span-2">
          <Label>Hình ảnh (Desktop) *</Label>
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                folder="banners"
                aspectRatio="video"
              />
            )}
          />
          {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
        </div>

        {/* Mobile Image URL */}
        <div className="space-y-2 col-span-2">
          <Label>Hình ảnh (Mobile - Tùy chọn)</Label>
          <Controller
            name="mobileImageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                folder="banners"
                aspectRatio="portrait"
              />
            )}
          />
        </div>

        {/* Action Link */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="actionLink">Đường dẫn khi click (Tùy chọn)</Label>
          <Input id="actionLink" {...register('actionLink')} placeholder="/shows/my-show" />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label htmlFor="position">Vị trí hiển thị</Label>
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('position')}
          >
            <option value="HOME_MAIN_SLIDER">Home Main Slider</option>
            <option value="HOME_MID_SECTION">Home Mid Section</option>
            <option value="POPUP">Popup</option>
            <option value="SIDEBAR">Sidebar</option>
          </select>
          {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
        </div>

        {/* Display Order */}
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
          <Input id="displayOrder" type="number" {...register('displayOrder')} />
          {errors.displayOrder && <p className="text-sm text-red-500">{errors.displayOrder.message}</p>}
        </div>

        {/* Active Status */}
        <div className="space-y-2 col-span-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isActive" 
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            {...register('isActive')}
          />
          <Label htmlFor="isActive" className="cursor-pointer">Kích hoạt hiển thị</Label>
        </div>

        {/* Start/End Time */}
        <div className="space-y-2">
          <Label htmlFor="startTime">Thời gian bắt đầu (Tùy chọn)</Label>
          <Input id="startTime" type="datetime-local" {...register('startTime')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Thời gian kết thúc (Tùy chọn)</Label>
          <Input id="endTime" type="datetime-local" {...register('endTime')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}
