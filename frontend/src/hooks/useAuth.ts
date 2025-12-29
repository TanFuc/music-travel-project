'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { authService, LoginRequest, RegisterRequest } from '@/services/auth.service';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code: string;
}

export function useAuth() {
  const router = useRouter();
  const { login: storeLogin, logout: storeLogout, isAuthenticated, user } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      storeLogin(response.user, response.accessToken, response.refreshToken);
      toast.success('Đăng nhập thành công!');
      router.push('/');
    },
    onError: (error: AxiosError<{ message: string; code: string }>) => {
      const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      storeLogin(response.user, response.accessToken, response.refreshToken);
      toast.success('Đăng ký thành công!');
      router.push('/');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });

  const logout = () => {
    authService.logout().catch(() => {
      // Ignore logout API errors
    });
    storeLogout();
    toast.success('Đăng xuất thành công!');
    router.push('/');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
