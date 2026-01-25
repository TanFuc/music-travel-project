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

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^0[3-9]\d{8,9}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await post<LoginResponse>('/auth/login', data);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Đăng nhập thành công!');

      // Redirect based on role
      if (response.user.role === 'ADMIN' || response.user.role === 'STAFF') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shows');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Đăng Nhập</CardTitle>
        <CardDescription>Nhập thông tin để đăng nhập vào tài khoản</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-error-500">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
          <p className="text-sm text-neutral-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-brand-500 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
