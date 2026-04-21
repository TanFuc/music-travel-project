'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { post, put, get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(3, 'Tên quá ngắn'),
  duration: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  description: z.string().optional(),
  linkedShowId: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface TourFormProps {
  isCombo: boolean;
  initialData?: FormData & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TourForm({ isCombo, initialData, onSuccess, onCancel }: TourFormProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  const { data: shows } = useQuery({
    queryKey: ['upcoming-shows'],
    queryFn: () => get<any>('/shows?status=UPCOMING'),
    enabled: isCombo,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, isCombo };
      if (initialData?.id) {
        return put(`/tours/${initialData.id}`, payload);
      }
      return post('/tours', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success(initialData?.id ? 'Cập nhật thành công!' : 'Tạo thành công!');
      if (onSuccess) onSuccess();
    },
    onError: () => toast.error('Có lỗi xảy ra, vui lòng thử lại!'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 bg-white p-4 rounded-lg border">
      <div>
        <label className="text-sm font-semibold">Tên {isCombo ? 'Combo' : 'Tour'}</label>
        <Input {...register('title')} placeholder="VD: Khám phá Đà Lạt..." />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Thời lượng</label>
          <Input {...register('duration')} placeholder="VD: 3N2Đ" />
        </div>
        <div>
          <label className="text-sm font-semibold">Giá từ (VNĐ)</label>
          <Input type="number" {...register('minPrice')} placeholder="VD: 2500000" />
        </div>
      </div>
      
      {isCombo && (
        <div>
          <label className="text-sm font-semibold">Link với Show diễn</label>
          <select 
            {...register('linkedShowId')} 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Chọn Show diễn --</option>
            {shows?.items?.map((show: any) => (
              <option key={show.id} value={show.id}>{show.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold">Mô tả ngắn</label>
        <textarea
          {...register('description')}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Mô tả..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
        </Button>
      </div>
    </form>
  );
}
