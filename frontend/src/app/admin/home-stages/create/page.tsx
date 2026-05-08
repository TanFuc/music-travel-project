'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { post } from '@/lib/api';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/ImageUpload';
const formSchema = z.object({
  title: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
  imageUrl: z.string().url('URL hình ảnh không hợp lệ'),
  description: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().default(0),
});
type FormValues = z.infer<typeof formSchema>;
export default function CreateHomeStagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isActive: true,
      displayOrder: 0,
    },
  });
  const imageUrl = watch('imageUrl');
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await post('/home-stages', data);
      toast.success('Thêm sân khấu thành công');
      router.push('/admin/home-stages');
    } catch {
      toast.error('Có lỗi xảy ra khi thêm sân khấu');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/home-stages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Thêm Sân khấu Mới</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Sân khấu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tên sân khấu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ví dụ: Sân khấu Mây Lang Thang"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">
                Hình ảnh <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="home-stages"
                    aspectRatio="video"
                  />
                )}
              />
              {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input id="location" {...register('location')} placeholder="Ví dụ: Đà Lạt" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                <Input id="displayOrder" type="number" {...register('displayOrder')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Mô tả ngắn về sân khấu..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-neutral-50 p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Trạng thái hoạt động</Label>
                <p className="text-sm text-neutral-500">Hiển thị trên trang chủ</p>
              </div>
              <Switch
                checked={watch('isActive')}
                onCheckedChange={(checked) => {
                  const event = { target: { name: 'isActive', value: checked } };
                  register('isActive').onChange(event);
                }}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admin/home-stages">
                <Button variant="outline" type="button">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo Sân khấu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
