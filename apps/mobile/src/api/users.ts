import { apiRequest } from '@/api/client';
import type { CommissionRateEntry, Role, UserSummary } from '@/api/types';

export function listUsers(): Promise<UserSummary[]> {
  return apiRequest<UserSummary[]>('/api/users');
}

export function getUser(id: string): Promise<UserSummary> {
  return apiRequest<UserSummary>(`/api/users/${id}`);
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
};

export function createUser(input: CreateUserInput): Promise<UserSummary> {
  return apiRequest<UserSummary>('/api/users', { method: 'POST', body: input });
}

export function getCommissionRateHistory(userId: string): Promise<CommissionRateEntry[]> {
  return apiRequest<CommissionRateEntry[]>(`/api/users/${userId}/commission-rate-history`);
}

export function setCommissionRate(userId: string, rate: number): Promise<CommissionRateEntry> {
  return apiRequest<CommissionRateEntry>(`/api/users/${userId}/commission-rate-history`, {
    method: 'POST',
    body: { rate },
  });
}
