import { api } from '@/lib/api';

export interface CommissionSummary {
  totalEarnings: number;
  pendingCommissions: number;
  availableBalance: number;
  totalOrders: number;
  totalTicketsSold: number;
}

export interface CommissionDetail {
  orderId: number;
  orderCode: string;
  orderDate: string;
  customerName: string;
  ticketQty: number;
  totalCommission: number;
  discountGiven: number;
  netEarnings: number;
  paymentStatus: string;
  commissionStatus: 'LOCKED' | 'AVAILABLE';
}

export interface CollaboratorVoucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateVoucherDto {
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
}

export interface CollaboratorContent {
  id: number;
  title: string;
  content: string;
  bannerUrl?: string;
  benefits?: string[];
  updatedAt: string;
}

// Get collaborator content (public)
export const getCollaboratorContent = async (): Promise<CollaboratorContent | null> => {
  const response = await api.get('/collaborator/content');
  return response.data;
};

// Get commission summary
export const getCommissionSummary = async (): Promise<CommissionSummary> => {
  const response = await api.get('/collaborator/dashboard/summary');
  return response.data;
};

// Get commission details with pagination
export const getCommissionDetails = async (params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PAID' | 'UNPAID';
}) => {
  const response = await api.get('/collaborator/dashboard/commissions', { params });
  return response.data;
};

// Get my vouchers
export const getMyVouchers = async (): Promise<CollaboratorVoucher[]> => {
  const response = await api.get('/collaborator/vouchers');
  return response.data;
};

// Create a new voucher
export const createVoucher = async (dto: CreateVoucherDto): Promise<CollaboratorVoucher> => {
  const response = await api.post('/collaborator/vouchers', dto);
  return response.data;
};

// Register as collaborator
export const becomeCollaborator = async () => {
  const response = await api.post('/collaborator/register');
  return response.data;
};

// Admin: Get all collaborators
export const getAllCollaborators = async (params: { page?: number; limit?: number; search?: string }) => {
  const response = await api.get('/admin/collaborators', { params });
  return response.data;
};

// Admin: Update collaborator content
export const updateCollaboratorContent = async (data: {
  title: string;
  content: string;
  bannerUrl?: string;
  benefits?: string[];
}) => {
  const response = await api.put('/admin/collaborators/content', data);
  return response.data;
};

// Admin: Toggle collaborator status
export const toggleCollaboratorStatus = async (userId: number, isCollaborator: boolean) => {
  const response = await api.put(`/admin/collaborators/${userId}/status`, { isCollaborator });
  return response.data;
};
