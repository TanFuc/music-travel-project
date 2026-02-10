import { post } from '@/lib/api';
import { User } from '@/types/api.types';

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  fullName: string;

}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  login: (data: LoginRequest) => post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => post<AuthResponse>('/auth/register', data),

  refreshToken: (data: RefreshTokenRequest) => post<AuthResponse>('/auth/refresh-token', data),

  logout: () => post<void>('/auth/logout'),
};
