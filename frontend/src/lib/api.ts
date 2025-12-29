import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API functions
export async function get<T>(url: string): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data.data as T;
}

export async function post<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

export async function patch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data.data as T;
}
