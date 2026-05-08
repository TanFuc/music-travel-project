'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { post, get } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
const schema = z.object({
  title: z.string().min(5, 'Tiêu đề quá ngắn'),
  message: z.string().min(10, 'Nội dung quá ngắn'),
  type: z.enum(['ORDER', 'PROMOTION', 'SYSTEM']),
  userId: z.coerce.number().optional().nullable(),
  isBroadcast: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;
interface NotificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}
export function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'SYSTEM',
      isBroadcast: true,
    },
  });
  const isBroadcast = watch('isBroadcast');
  const { data: users } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => get<any>('/admin/users?limit=100'),
    enabled: !isBroadcast,
  });
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (data.isBroadcast) {
        return post('/admin/notifications/broadcast', {
          title: data.title,
          message: data.message,
          type: data.type,
        });
      }
      return post('/admin/notifications', {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Gửi thông báo thành công!');
      if (onSuccess) onSuccess();
    },
    onError: () => toast.error('Lỗi khi gửi thông báo!'),
  });
  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="space-y-2">
        <Label>Đối tượng nhận</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={isBroadcast ? 'default' : 'outline'}
            onClick={() => setValue('isBroadcast', true)}
            className="flex-1"
          >
            Tất cả người dùng
          </Button>
          <Button
            type="button"
            variant={!isBroadcast ? 'default' : 'outline'}
            onClick={() => setValue('isBroadcast', false)}
            className="flex-1"
          >
            Người dùng cụ thể
          </Button>
        </div>
      </div>

      {!isBroadcast && (
        <div className="space-y-2">
          <Label>Chọn người dùng</Label>
          <Select onValueChange={(val) => setValue('userId', parseInt(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn người dùng..." />
            </SelectTrigger>
            <SelectContent>
              {users?.items?.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.fullName} ({user.phoneNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Loại thông báo</Label>
        <Select onValueChange={(val: any) => setValue('type', val)} defaultValue="SYSTEM">
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SYSTEM">Hệ thống</SelectItem>
            <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
            <SelectItem value="ORDER">Đơn hàng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" {...register('title')} placeholder="Tiêu đề thông báo..." />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Nội dung</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Nội dung chi tiết thông báo..."
          className="min-h-[120px]"
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang gửi...' : 'Gửi thông báo'}
        </Button>
      </div>
    </form>
  );
}
