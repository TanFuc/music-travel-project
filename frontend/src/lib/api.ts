import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Request deduplication - prevent duplicate requests
const pendingRequests = new Map<string, Promise<any>>();

function getRequestKey(config: any): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token and deduplicate requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Deduplication: check if identical request is already pending
    const requestKey = getRequestKey(config);
    const pendingRequest = pendingRequests.get(requestKey);

    if (pendingRequest) {
      // Return the existing pending request
      console.log('🔄 Deduplicating request:', config.url);
      return Promise.reject({ __CANCEL__: true, pendingRequest });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Remove from pending requests on success
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  async (error: any) => {
    // Handle deduplication cancellation
    if (error.__CANCEL__) {
      return error.pendingRequest;
    }

    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Remove from pending requests on error
    if (originalRequest) {
      const requestKey = getRequestKey(originalRequest);
      pendingRequests.delete(requestKey);
    }

    // Handle 401 - try to refresh token
    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
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

    return Promise.reject(axiosError);
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
  const requestKey = `GET-${url}--`;

  // Check if request is already pending
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  // Create new request and track it
  const requestPromise = (async () => {
    try {
      const response = await api.get<T | ApiResponse<T>>(url);
      // Check if response is wrapped in ApiResponse format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<T> & { meta?: { page: number; limit: number; total: number; totalPages: number } };
        // Check if this is a paginated response (has meta at root level)
        if ('meta' in apiResponse && apiResponse.meta) {
          // Return as paginated format: { items: data, meta: meta }
          return { items: apiResponse.data, meta: apiResponse.meta } as T;
        }
        return apiResponse.data as T;
      }
      // Otherwise return data directly
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
  // Check if response is wrapped in ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}

export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.put<T | ApiResponse<T>>(url, data);
  if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}

export async function patch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await api.patch<T | ApiResponse<T>>(url, data);
  if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const response = await api.delete<T | ApiResponse<T>>(url);
  if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  return response.data as T;
}
