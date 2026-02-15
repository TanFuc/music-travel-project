import { api } from '@/lib/api';

export interface AuditLog {
  id: string;
  userId: number | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  module: string | null;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    phoneNumber: string;
    role: string;
  } | null;
}

export interface AuditLogFilter {
  userId?: number;
  action?: string;
  entity?: string;
  entityId?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Get all audit logs with filters
export const getAuditLogs = async (filter: AuditLogFilter) => {
  const response = await api.get('/admin/audit-logs', { params: filter });
  return response.data;
};

// Get audit log by ID
export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await api.get(`/admin/audit-logs/${id}`);
  return response.data;
};

// Get distinct action types
export const getActionTypes = async (): Promise<string[]> => {
  const response = await api.get('/admin/audit-logs/actions');
  return response.data;
};

// Get distinct entity types
export const getEntityTypes = async (): Promise<string[]> => {
  const response = await api.get('/admin/audit-logs/entities');
  return response.data;
};

// Get distinct modules
export const getModules = async (): Promise<string[]> => {
  const response = await api.get('/admin/audit-logs/modules');
  return response.data;
};

// Helper to compute diff for display
export const computeDiff = (
  oldValue: Record<string, unknown> | null,
  newValue: Record<string, unknown> | null,
): { key: string; old: unknown; new: unknown }[] => {
  const diff: { key: string; old: unknown; new: unknown }[] = [];

  if (!oldValue && !newValue) return diff;

  const allKeys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);

  for (const key of allKeys) {
    const oldVal = oldValue?.[key];
    const newVal = newValue?.[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff.push({ key, old: oldVal, new: newVal });
    }
  }

  return diff;
};
