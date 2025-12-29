export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code: string;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string[]>;
}
