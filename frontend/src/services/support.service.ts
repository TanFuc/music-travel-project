import { api } from '@/lib/api';
export interface SupportQuestion {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Complaint {
  id: number;
  userId: number | null;
  orderId: number | null;
  content: string;
  status: 'NEW' | 'PROCESSING' | 'RESOLVED';
  adminReply: string | null;
  repliedBy: number | null;
  repliedAt: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string | null;
  } | null;
}
export interface CreateQuestionDto {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
  isActive?: boolean;
}
export interface UpdateQuestionDto {
  question?: string;
  answer?: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
}
export interface CreateComplaintDto {
  content: string;
  orderId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}
export interface ReplyComplaintDto {
  adminReply: string;
  status?: 'NEW' | 'PROCESSING' | 'RESOLVED';
}
export const getPublicFAQs = async (): Promise<Record<string, SupportQuestion[]>> => {
  const response = await api.get('/support/faq');
  return response.data?.data || {};
};
export const getFAQCategories = async (): Promise<string[]> => {
  const response = await api.get('/support/faq/categories');
  return response.data?.data || [];
};
export const submitComplaint = async (dto: CreateComplaintDto): Promise<Complaint> => {
  const response = await api.post('/support/complaints', dto);
  return response.data?.data;
};
export const getMyComplaints = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/support/my-complaints', { params });
  return response.data?.data;
};
export const getAllFAQs = async (params: {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
}) => {
  const response = await api.get('/admin/faq', { params });
  return response.data?.data;
};
export const getFAQById = async (id: number): Promise<SupportQuestion> => {
  const response = await api.get(`/admin/faq/${id}`);
  return response.data?.data;
};
export const createFAQ = async (dto: CreateQuestionDto): Promise<SupportQuestion> => {
  const response = await api.post('/admin/faq', dto);
  return response.data?.data;
};
export const updateFAQ = async (id: number, dto: UpdateQuestionDto): Promise<SupportQuestion> => {
  const response = await api.put(`/admin/faq/${id}`, dto);
  return response.data?.data;
};
export const deleteFAQ = async (id: number): Promise<void> => {
  await api.delete(`/admin/faq/${id}`);
};
export const getAllComplaints = async (params: {
  page?: number;
  limit?: number;
  status?: 'NEW' | 'PROCESSING' | 'RESOLVED';
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/admin/complaints', { params });
  return response.data?.data;
};
export const getComplaintById = async (id: number): Promise<Complaint> => {
  const response = await api.get(`/admin/complaints/${id}`);
  return response.data?.data;
};
export const replyToComplaint = async (id: number, dto: ReplyComplaintDto): Promise<Complaint> => {
  const response = await api.put(`/admin/complaints/${id}/reply`, dto);
  return response.data?.data;
};
export const updateComplaintStatus = async (
  id: number,
  status: 'NEW' | 'PROCESSING' | 'RESOLVED'
): Promise<Complaint> => {
  const response = await api.put(`/admin/complaints/${id}/status`, { status });
  return response.data?.data;
};
export const getComplaintStats = async (): Promise<{
  total: number;
  new: number;
  processing: number;
  resolved: number;
}> => {
  const response = await api.get('/admin/complaints/stats');
  return response.data?.data;
};
