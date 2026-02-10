import { get, post, put, del } from '@/lib/api';

export interface SingerPackage {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  description?: string;
  benefits?: string[];
  colorCode?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  maxRegistrations?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}

export interface CreateSingerPackageDto {
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  description?: string;
  benefits?: string[];
  colorCode?: string;
  icon?: string;
  displayOrder?: number;
  maxRegistrations?: number;
  isActive?: boolean;
}

export interface UpdateSingerPackageDto extends Partial<CreateSingerPackageDto> { }

export interface SingerPackageFilterDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface SingerPackageListResponse {
  data: SingerPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingerPackageStatistics {
  totalPackages: number;
  activePackages: number;
  totalRegistrations: number;
  packageRegistrationStats: Array<{
    id: string;
    name: string;
    registrationCount: number;
  }>;
}

export const singerPackageService = {
  // Public endpoints
  async getActivePackages(): Promise<SingerPackage[]> {
    return get<SingerPackage[]>('/singer-packages/active');
  },

  // Admin endpoints
  async getPackages(filters?: SingerPackageFilterDto): Promise<SingerPackageListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (typeof filters?.isActive === 'boolean') params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return get<SingerPackageListResponse>(`/singer-packages${query ? `?${query}` : ''}`);
  },

  async getPackage(id: string): Promise<SingerPackage> {
    return get<SingerPackage>(`/singer-packages/${id}`);
  },

  async createPackage(data: CreateSingerPackageDto): Promise<SingerPackage> {
    return post<SingerPackage>('/singer-packages', data);
  },

  async updatePackage(id: string, data: UpdateSingerPackageDto): Promise<SingerPackage> {
    return put<SingerPackage>(`/singer-packages/${id}`, data);
  },

  async deletePackage(id: string): Promise<void> {
    return del(`/singer-packages/${id}`);
  },

  async getStatistics(): Promise<SingerPackageStatistics> {
    return get<SingerPackageStatistics>('/singer-packages/statistics');
  },
};