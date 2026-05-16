'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { post, put, get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Music, MapPin, Plus, Trash2 } from 'lucide-react';
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại vé là bắt buộc'),
  price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
});
const schema = z.object({
  title: z.string().min(3, 'Tên quá ngắn'),
  duration: z.string().optional(),
  minPrice: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  description: z.string().optional(),
  linkedShowId: z.coerce.number().optional().nullable(),
  departureLocId: z.coerce.number().optional().nullable(),
  destinationLocId: z.coerce.number().optional().nullable(),
  branchId: z.coerce.number().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'Cần ít nhất 1 loại vé'),
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
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          duration: initialData.duration,
          minPrice: initialData.minPrice || 0,
          description: initialData.description,
          linkedShowId: initialData.linkedShowId || null,
          departureLocId: initialData.departureLocId || initialData.departureLoc?.id || null,
          destinationLocId: initialData.destinationLocId || initialData.destinationLoc?.id || null,
          branchId: initialData.branchId || initialData.branch?.id || null,
          metaTitle: initialData.metaTitle,
          metaDescription: initialData.metaDescription,
          ticketTypes: initialData.properties?.ticketTypes?.map((ticketType: any) => ({
            name: ticketType?.name || '',
            price: Number(ticketType?.price || 0),
          })) || [{ name: 'Gói tiêu chuẩn', price: initialData.minPrice || 0 }],
        }
      : {
          minPrice: 0,
          ticketTypes: [{ name: 'Gói tiêu chuẩn', price: 0 }],
        },
  });
  const {
    fields: ticketTypeFields,
    append: appendTicketType,
    remove: removeTicketType,
  } = useFieldArray({
    control,
    name: 'ticketTypes',
  });
  const linkedShowId = watch('linkedShowId');
  const departureLocId = watch('departureLocId');
  const destinationLocId = watch('destinationLocId');
  const { data: shows } = useQuery({
    queryKey: ['admin-shows-all'],
    queryFn: () => get<any>('/shows?limit=100'),
    enabled: isCombo,
  });
  const { data: locations } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => get<any>('/locations'),
  });
  const { data: branches } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: () => get<any>('/branches?limit=50'),
  });
  const selectedShow = shows?.items?.find((s: any) => s.id === linkedShowId);
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        title: data.title,
        duration: data.duration,
        minPrice: data.minPrice,
        description: data.description,
        ...(isCombo && { linkedShowId: data.linkedShowId }),
        ...(data.departureLocId && { departureLocId: data.departureLocId }),
        ...(data.destinationLocId && { destinationLocId: data.destinationLocId }),
        ...(data.branchId && { branchId: data.branchId }),
        ...(data.metaTitle && { metaTitle: data.metaTitle }),
        ...(data.metaDescription && { metaDescription: data.metaDescription }),
        properties: {
          ...(initialData?.properties || {}),
          ticketTypes: data.ticketTypes,
        },
      };
      const endpoint = isCombo ? '/combos' : '/tours';
      if (isEditing) {
        return put(`${endpoint}/${initialData.id}`, payload);
      }
      return post(endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success(isEditing ? 'Cập nhật thành công!' : 'Tạo thành công!');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    },
  });
  const locationItems = Array.isArray(locations) ? locations : locations?.items || [];
  const branchItems = Array.isArray(branches) ? branches : branches?.items || [];
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">
          Tên {isCombo ? 'Combo' : 'Tour'} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder={
            isCombo ? 'VD: Combo Đà Lạt & Đêm Nhạc Acoustic...' : 'VD: Tour Khám Phá Đà Lạt 3N2Đ...'
          }
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Thời lượng</Label>
          <Input id="duration" {...register('duration')} placeholder="VD: 3N2Đ" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice">
            Giá từ (VNĐ) <span className="text-red-500">*</span>
          </Label>
          <Input id="minPrice" type="number" min={0} {...register('minPrice')} />
          {errors.minPrice && <p className="text-xs text-red-500">{errors.minPrice.message}</p>}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm font-semibold text-amber-700">
            Loại vé riêng cho {isCombo ? 'Combo' : 'Tour'}
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendTicketType({ name: '', price: 0 })}
            className="border-amber-200 bg-white text-amber-700 hover:bg-amber-100"
          >
            <Plus className="mr-1 h-4 w-4" />
            Thêm loại vé
          </Button>
        </div>

        <div className="space-y-3">
          {ticketTypeFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-amber-100 bg-white p-3 sm:grid-cols-[1fr_180px_auto]"
            >
              <div className="space-y-1">
                <Label className="text-xs text-neutral-600">Tên loại vé</Label>
                <Input
                  {...register(`ticketTypes.${index}.name` as const)}
                  placeholder="VD: Vé tiêu chuẩn"
                />
                {errors.ticketTypes?.[index]?.name && (
                  <p className="text-xs text-red-500">{errors.ticketTypes[index]?.name?.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-neutral-600">Giá (VNĐ)</Label>
                <Input type="number" min={0} {...register(`ticketTypes.${index}.price` as const)} />
                {errors.ticketTypes?.[index]?.price && (
                  <p className="text-xs text-red-500">
                    {errors.ticketTypes[index]?.price?.message}
                  </p>
                )}
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                  disabled={ticketTypeFields.length === 1}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {errors.ticketTypes?.message && (
            <p className="text-xs text-red-500">{errors.ticketTypes.message}</p>
          )}
        </div>
      </div>

      {isCombo && (
        <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-indigo-600" />
            <Label className="text-sm font-semibold text-indigo-700">
              Liên kết Đêm nhạc (Show)
            </Label>
          </div>
          <Select
            value={linkedShowId?.toString() || ''}
            onValueChange={(val) =>
              setValue('linkedShowId', val && val !== '0' ? parseInt(val, 10) : null)
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Chọn show diễn để liên kết..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">-- Không liên kết --</SelectItem>
              {shows?.items?.map((show: any) => (
                <SelectItem key={show.id} value={show.id.toString()}>
                  <div className="flex flex-col">
                    <span>{show.title}</span>
                    {show.performTime && (
                      <span className="text-xs text-neutral-500">
                        {new Date(show.performTime).toLocaleDateString('vi-VN')}
                        {show.stage?.name && ` · ${show.stage.name}`}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedShow && (
            <div className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2 text-xs text-indigo-700">
              <Badge className="bg-indigo-600 text-[10px] text-white">Đã chọn</Badge>
              <span className="font-semibold">{selectedShow.title}</span>
              {selectedShow.stage?.name && (
                <span className="text-indigo-500">· {selectedShow.stage.name}</span>
              )}
            </div>
          )}
          <p className="text-xs text-indigo-500">
            Liên kết với một đêm nhạc để tạo gói Combo hoàn chỉnh.
          </p>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <Label className="text-sm font-semibold text-emerald-700">Địa điểm</Label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-600">Điểm khởi hành</Label>
            <Select
              value={departureLocId?.toString() || ''}
              onValueChange={(val) =>
                setValue('departureLocId', val && val !== '0' ? parseInt(val, 10) : null)
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn điểm khởi hành..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">-- Không chọn --</SelectItem>
                {locationItems.map((loc: any) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-600">Điểm đến</Label>
            <Select
              value={destinationLocId?.toString() || ''}
              onValueChange={(val) =>
                setValue('destinationLocId', val && val !== '0' ? parseInt(val, 10) : null)
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn điểm đến..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">-- Không chọn --</SelectItem>
                {locationItems.map((loc: any) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {branchItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-neutral-600">Chi nhánh quản lý</Label>
            <Select
              value={watch('branchId')?.toString() || ''}
              onValueChange={(val) =>
                setValue('branchId', val && val !== '0' ? parseInt(val, 10) : null)
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Chọn chi nhánh..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">-- Không chọn --</SelectItem>
                {branchItems.map((b: any) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={
            isCombo
              ? 'Mô tả gói Combo, bao gồm những gì, ưu đãi gì...'
              : 'Mô tả hành trình, điểm nổi bật của tour...'
          }
          className="min-h-[100px]"
        />
      </div>

      <details className="rounded-lg border border-neutral-200 bg-neutral-50/50">
        <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Cài đặt SEO (tuỳ chọn)
        </summary>
        <div className="space-y-3 p-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="metaTitle" className="text-xs">
              Meta Title
            </Label>
            <Input id="metaTitle" {...register('metaTitle')} placeholder="Tiêu đề SEO..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription" className="text-xs">
              Meta Description
            </Label>
            <Textarea
              id="metaDescription"
              {...register('metaDescription')}
              placeholder="Mô tả SEO..."
              className="min-h-[60px]"
            />
          </div>
        </div>
      </details>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className={isCombo ? 'bg-amber-600 hover:bg-amber-700' : ''}
        >
          {mutation.isPending ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}
