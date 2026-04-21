import { get, post, patch, del } from '@/lib/api';
import type { SingerRegistrationFormData } from '@/lib/validations/singer-registration.schema';
export interface SingerRegistration {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  age: number;
  gender: string;
  address: string;
  singingExperience: string;
  favoriteGenre: string;
  package: string;
  introduction?: string;
  voiceSampleUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface SingerRegistrationFilter {
  page?: number;
  limit?: number;
  status?: string;
  package?: string;
  packageTemplateId?: string;
  singingExperience?: string;
  search?: string;
}
export interface SingerRegistrationResponse {
  data: SingerRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface SingerStatistics {
  total: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  byPackage: Record<string, number>;
  byExperience: Record<string, number>;
}
export const singerService = {
  register: (data: Omit<SingerRegistrationFormData, 'agreeToTerms'>) =>
    post<{
      message: string;
      data: SingerRegistration;
    }>('/singers/register', data),
  getMyRegistrations: () => get<SingerRegistration[]>('/singers/my-registrations'),
  uploadVoiceSample: async (
    file: File
  ): Promise<{
    url: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/v1/singers/upload-voice-sample', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },
  getAll: (filter?: SingerRegistrationFilter) => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return get<SingerRegistrationResponse>(`/singers${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id: string) => get<SingerRegistration>(`/singers/${id}`),
  update: (id: string, data: Partial<SingerRegistration>) =>
    patch<SingerRegistration>(`/singers/${id}`, data),
  updateStatus: (id: string, status: string, adminNotes?: string) =>
    patch<SingerRegistration>(`/singers/${id}/status`, { status, adminNotes }),
  delete: (id: string) => del(`/singers/${id}`),
  getStatistics: () => get<SingerStatistics>('/singers/statistics'),
};
