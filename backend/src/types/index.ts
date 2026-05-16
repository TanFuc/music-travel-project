export * from '../common/dto/pagination.dto';
export interface ApiRequest {
  id?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type UserRole = 'ADMIN' | 'STAFF' | 'USER' | 'PARTNER';
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
export interface CacheOptions {
  ttl?: number;
  key: string;
}
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
