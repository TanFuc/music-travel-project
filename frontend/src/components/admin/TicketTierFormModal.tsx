'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { post, patch } from '@/lib/api';
import { toast } from 'sonner';

// Validation schema
const ticketTierSchema = z.object({
  name: z.string().min(3, 'Tên vé phải có ít nhất 3 ký tự'),
  nameEn: z.string().optional().nullable(),
  price: z.number({ required_error: 'Vui lòng nhập giá vé' }).min(0, 'Giá không được âm'),
  description: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  colorCode: z.string().optional().nullable(),
  priority: z.number().min(0).default(0),
  groupSize: z.number().min(1).default(1),
  totalQuantity: z.number().min(0).default(0),
  maxPerOrder: z.number().min(1).default(10),
  isActive: z.boolean().default(true),
});

type TicketTierFormData = z.infer<typeof ticketTierSchema>;

interface TicketTier {
  id: number;
  name: string;
  nameEn?: string | null;
  price: number;
  description?: string | null;
  benefits?: string | null;
  targetAudience?: string | null;
  colorCode?: string | null;
  priority: number;
  groupSize: number;
  totalQuantity: number;
  soldCount: number;
  maxPerOrder: number;
  isActive: boolean;
}

interface TicketTierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: TicketTier | null;
}

const DEFAULT_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function TicketTierFormModal({ isOpen, onClose, onSuccess, initialData }: TicketTierFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TicketTierFormData>({
    resolver: zodResolver(ticketTierSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      price: 0,
      description: '',
      benefits: '',
      targetAudience: '',
      colorCode: '#22C55E',
      priority: 0,
      groupSize: 1,
      totalQuantity: 100,
      maxPerOrder: 10,
      isActive: true,
    },
  });

  const selectedColor = watch('colorCode');
  const isActive = watch('isActive');

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        name: initialData.name,
        nameEn: initialData.nameEn || '',
        price: Number(initialData.price),
        description: initialData.description || '',
        benefits: initialData.benefits || '',
        targetAudience: initialData.targetAudience || '',
        colorCode: initialData.colorCode || '#22C55E',
        priority: initialData.priority,
        groupSize: initialData.groupSize,
        totalQuantity: initialData.totalQuantity,
        maxPerOrder: initialData.maxPerOrder,
        isActive: initialData.isActive,
      });
    } else if (!initialData && isOpen) {
      reset({
        name: '',
        nameEn: '',
        price: 0,
        description: '',
        benefits: '',
        targetAudience: '',
        colorCode: '#22C55E',
        priority: 0,
        groupSize: 1,
        totalQuantity: 100,
        maxPerOrder: 10,
        isActive: true,
      });
    }
  }, [initialData, isOpen, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TicketTierFormData) => post('/admin/ticket-tiers', data),
    onSuccess: () => {
      toast.success('Tạo loại vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo loại vé');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: TicketTierFormData) => patch(`/admin/ticket-tiers/${initialData?.id}`, data),
    onSuccess: () => {
      toast.success('Cập nhật loại vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-tiers'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật loại vé');
    },
  });

  const onSubmit = (data: TicketTierFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">{isEdit ? 'Sửa loại vé' : 'Tạo loại vé mới'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Tên loại vé *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="VD: Vé Hạt Xanh - Green Solo"
                  className="mt-1"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="nameEn">Tên tiếng Anh</Label>
                <Input
                  id="nameEn"
                  {...register('nameEn')}
                  placeholder="VD: Green Solo"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Giá vé (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="350000"
                  className="mt-1"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>

            {/* Description & Benefits */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Mỗi cá nhân là một 'hạt mầm' lan tỏa lối sống xanh."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Quyền lợi</Label>
                <Textarea
                  id="benefits"
                  {...register('benefits')}
                  placeholder="Đồ uống + ăn nhẹ. Ghế ngồi khu Green Solo."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Đối tượng</Label>
                <Input
                  id="targetAudience"
                  {...register('targetAudience')}
                  placeholder="Khách lẻ, bạn trẻ, người yêu âm nhạc"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <Label>Màu sắc</Label>
              <div className="flex items-center gap-2 mt-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('colorCode', color)}
                  />
                ))}
                <Input
                  type="color"
                  value={selectedColor || '#22C55E'}
                  onChange={(e) => setValue('colorCode', e.target.value)}
                  className="w-10 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Quantity Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="totalQuantity">Tổng số vé</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  {...register('totalQuantity', { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="text-xs text-neutral-500 mt-1">0 = không giới hạn</p>
              </div>

              <div>
                <Label htmlFor="maxPerOrder">Tối đa/đơn</Label>
                <Input
                  id="maxPerOrder"
                  type="number"
                  {...register('maxPerOrder', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="groupSize">Số người/vé</Label>
                <Input
                  id="groupSize"
                  type="number"
                  {...register('groupSize', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="priority">Thứ tự hiển thị</Label>
                <Input
                  id="priority"
                  type="number"
                  {...register('priority', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <Label htmlFor="isActive" className="font-medium">Kích hoạt bán vé</Label>
                <p className="text-sm text-neutral-500">Cho phép hiển thị và bán loại vé này</p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-neutral-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="gap-2"
            >
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
