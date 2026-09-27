import { apiRequest } from '@/api/client';
import type { CashbackBalance, CashbackConfig } from '@/api/types';

export function getCashbackConfig(): Promise<CashbackConfig> {
  return apiRequest<CashbackConfig>('/api/cashback/config');
}

export function setCashbackConfig(input: { percentage: number; validityDays: number }): Promise<CashbackConfig> {
  return apiRequest<CashbackConfig>('/api/cashback/config', { method: 'PATCH', body: input });
}

export function getCashbackBalance(customerId: string): Promise<CashbackBalance> {
  return apiRequest<CashbackBalance>(`/api/cashback/customers/${customerId}/balance`);
}
