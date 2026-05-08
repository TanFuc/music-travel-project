import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
const isServer = typeof window === 'undefined';
const API_URL =
  !isServer && process.env.NODE_ENV === 'production'
    ? '/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2222/api/v1';
const pendingRequests = new Map<string, Promise<any>>();
function getRequestKey(config: any): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
}
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    const requestKey = getRequestKey(config);
    const pendingRequest = pendingRequests.get(requestKey);
    if (pendingRequest) {
      return Promise.reject({ __CANCEL__: true, pendingRequest });
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  async (error: any) => {
    if (error.__CANCEL__) {
      return error.pendingRequest;
    }
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const responseData = axiosError.response?.data as any;
    if (originalRequest) {
      const requestKey = getRequestKey(originalRequest);
      pendingRequests.delete(requestKey);
    }
    const isSessionExpired =
      axiosError.response?.status === 401 || responseData?.code === 'AUTH_002';
    if (isSessionExpired && originalRequest && !originalRequest._retry) {
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
        } else {
          throw new Error('No refresh token');
        }
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          if (window.location.pathname !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          }
        }
      }
    }
    return Promise.reject(axiosError);
  }
);
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
export async function get<T>(url: string): Promise<T> {
  const requestKey = `GET-${url}--`;
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }
  const requestPromise = (async () => {
    try {
      const response = await api.get<T | ApiResponse<T>>(url);
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        'success' in response.data
      ) {
        const apiResponse = response.data as ApiResponse<T> & {
          meta?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || 'API Error');
        }
        if ('meta' in apiResponse && apiResponse.meta) {
          return { items: apiResponse.data, meta: apiResponse.meta } as T;
        }
        return apiResponse.data as T;
      }
      return response.data as T;
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}
export async function post<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.post<T | ApiResponse<T>>(url, data);
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'success' in response.data
  ) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.put<T | ApiResponse<T>>(url, data);
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'success' in response.data
  ) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
export async function patch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.patch<T | ApiResponse<T>>(url, data);
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'success' in response.data
  ) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<T | ApiResponse<T>>(url);
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'success' in response.data
  ) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
export async function upload<T>(url: string, formData: FormData): Promise<T> {
  const response = await api.post<T | ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'success' in response.data
  ) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
