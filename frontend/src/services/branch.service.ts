import { get } from '@/lib/api';
import { Branch } from '@/types/api.types';
export const branchService = {
  getBranches: () => get<Branch[]>('/branches'),
  getBranchById: (id: number) => get<Branch>(`/branches/${id}`),
};
