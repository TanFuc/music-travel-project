import { api } from '@/lib/api';
export interface WalletBalance {
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'LOCKED';
}
export interface WalletTransaction {
  id: string;
  walletId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: 'DEPOSIT' | 'PAYMENT' | 'REFUND' | 'WITHDRAW' | 'COMMISSION' | 'WITHDRAWAL';
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}
export interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  processedBy: number | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string | null;
  };
}
export interface WithdrawRequestDto {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await api.get('/wallet');
  return response.data;
};
export const getTransactions = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/wallet/transactions', { params });
  return response.data;
};
export const requestWithdrawal = async (dto: WithdrawRequestDto) => {
  const response = await api.post('/wallet/withdraw', dto);
  return response.data;
};
export const getMyWithdrawalRequests = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/wallet/withdrawals', { params });
  return response.data;
};
export const getAllWithdrawalRequests = async (params: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  search?: string;
}) => {
  const response = await api.get('/admin/wallet/withdrawals', { params });
  return response.data;
};
export const getWithdrawalStats = async () => {
  const response = await api.get('/admin/wallet/withdrawals/stats');
  return response.data;
};
export const approveWithdrawal = async (id: number, adminNote?: string) => {
  const response = await api.put(`/admin/wallet/withdrawals/${id}/approve`, { adminNote });
  return response.data;
};
export const rejectWithdrawal = async (id: number, adminNote: string) => {
  const response = await api.put(`/admin/wallet/withdrawals/${id}/reject`, { adminNote });
  return response.data;
};
