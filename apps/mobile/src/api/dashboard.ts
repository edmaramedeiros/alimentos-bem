import { apiRequest } from '@/api/client';
import type { DashboardIndicators } from '@/api/types';

export function getDashboardIndicators(month: string): Promise<DashboardIndicators> {
  return apiRequest<DashboardIndicators>(`/api/dashboard/indicators?month=${month}`);
}
