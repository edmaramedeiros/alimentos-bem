import { apiRequest } from '@/api/client';
import type { CommissionReport } from '@/api/types';

export function myCommissions(): Promise<CommissionReport> {
  return apiRequest<CommissionReport>('/api/commissions/me');
}

export function allCommissions(vendedorId?: string): Promise<CommissionReport> {
  const query = vendedorId ? `?vendedorId=${vendedorId}` : '';
  return apiRequest<CommissionReport>(`/api/commissions${query}`);
}
