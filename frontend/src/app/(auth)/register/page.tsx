'use client';

import { useState } from 'react';
import { Link } from '@/components/common/Link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { post } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^0[3-9]\d{8,9}$/, 'Số điện thoại không hợp lệ'),

  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    phoneNumber: string;
    fullName: string;
    email: string | null;
    role: string;
  };
}

export default function RegisterPage() {
  usePageTitle();
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = data;
      const response = await post<RegisterResponse>('/auth/register', submitData);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Đăng ký thành công!');
      router.push('/shows');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Đăng Ký</CardTitle>
        <CardDescription>Tạo tài khoản mới để bắt đầu đặt vé</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên
            </label>
            <Input id="fullName" placeholder="Nguyen Van A" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-error-500">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Số điện thoại
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="0901234567"
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-error-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <Input id="password" type="password" placeholder="********" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-error-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Xác nhận mật khẩu
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>
          <p className="text-sm text-neutral-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-brand-500 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
