'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, patch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
const schema = z.object({
  code: z.string().min(3, 'Mã voucher phải có ít nhất 3 ký tự').toUpperCase(),
  discountType: z.enum(['PERCENT', 'FIXED_AMOUNT']),
  discountValue: z.coerce.number().min(0, 'Giá trị phải lớn hơn hoặc bằng 0'),
  minOrderValue: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;
interface VoucherFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}
export function VoucherForm({ initialData, onSuccess, onCancel }: VoucherFormProps) {
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
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : '',
          endDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : '',
        }
      : {
          discountType: 'PERCENT',
          isActive: true,
        },
  });
  const discountType = watch('discountType');
  const isActive = watch('isActive');
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data };
      if (isEditing) {
        return patch(`/admin/vouchers/${initialData.id}`, payload);
      }
      return post('/admin/vouchers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success(isEditing ? 'Cập nhật voucher thành công!' : 'Tạo voucher thành công!');
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    },
  });
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Mã Voucher</Label>
          <Input id="code" {...register('code')} placeholder="VD: GIAMGIA10" disabled={isEditing} />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Loại giảm giá</Label>
          <Select
            value={discountType}
            onValueChange={(val: any) => setValue('discountType', val)}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại giảm giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Số tiền cố định (VND)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Giá trị giảm ({discountType === 'PERCENT' ? '%' : 'VND'})
          </Label>
          <Input id="discountValue" type="number" {...register('discountValue')} />
          {errors.discountValue && (
            <p className="text-xs text-red-500">{errors.discountValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Đơn hàng tối thiểu (VND)</Label>
          <Input id="minOrderValue" type="number" {...register('minOrderValue')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
          <Input
            id="usageLimit"
            type="number"
            {...register('usageLimit')}
            placeholder="Để trống nếu không giới hạn"
          />
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue('isActive', checked)}
          />
          <Label htmlFor="isActive">Đang hoạt động</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Ngày bắt đầu</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang lưu...' : 'Lưu voucher'}
        </Button>
      </div>
    </form>
  );
}
