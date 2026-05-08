'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { post, patch, get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
const schema = z.object({
  title: z.string().min(3, 'Tên quá ngắn'),
  duration: z.string().optional(),
  minPrice: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  description: z.string().optional(),
  linkedShowId: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;
interface TourFormProps {
  isCombo: boolean;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}
export function TourForm({ isCombo, initialData, onSuccess, onCancel }: TourFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      isActive: true,
      minPrice: 0,
    },
  });
  const isActive = watch('isActive');
  const linkedShowId = watch('linkedShowId');
  const { data: shows } = useQuery({
    queryKey: ['admin-shows-upcoming'],
    queryFn: () => get<any>('/shows?status=UPCOMING'),
    enabled: isCombo,
  });
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, isCombo };
      if (isEditing) {
        return patch(`/tours/${initialData.id}`, payload);
      }
      return post('/tours', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success(isEditing ? 'Cập nhật thành công!' : 'Tạo thành công!');
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    },
  });
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Tên {isCombo ? 'Combo' : 'Tour'}</Label>
        <Input id="title" {...register('title')} placeholder="VD: Khám phá Đà Lạt..." />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Thời lượng</Label>
          <Input id="duration" {...register('duration')} placeholder="VD: 3N2Đ" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice">Giá từ (VNĐ)</Label>
          <Input id="minPrice" type="number" {...register('minPrice')} />
        </div>
      </div>

      {isCombo && (
        <div className="space-y-2">
          <Label>Liên kết Đêm nhạc (Show)</Label>
          <Select
            value={linkedShowId?.toString() || ''}
            onValueChange={(val) => setValue('linkedShowId', parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn show diễn..." />
            </SelectTrigger>
            <SelectContent>
              {shows?.items?.map((show: any) => (
                <SelectItem key={show.id} value={show.id.toString()}>
                  {show.title} ({new Date(show.startDate).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả ngắn</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Tóm tắt về chương trình..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive">Cho phép hiển thị trên website</Label>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}
