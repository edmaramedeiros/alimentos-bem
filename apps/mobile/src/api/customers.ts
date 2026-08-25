import { apiRequest } from '@/api/client';
import type { Customer } from '@/api/types';

export function listCustomers(query?: string): Promise<Customer[]> {
  const search = query ? `?query=${encodeURIComponent(query)}` : '';
  return apiRequest<Customer[]>(`/api/customers${search}`);
}

export function getCustomer(id: string): Promise<Customer> {
  return apiRequest<Customer>(`/api/customers/${id}`);
}

export type CustomerInput = {
  name: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  grupo?: string;
  whatsappOptIn: boolean;
};

export function createCustomer(input: CustomerInput): Promise<Customer> {
  return apiRequest<Customer>('/api/customers', { method: 'POST', body: input });
}

export function updateCustomer(id: string, input: CustomerInput & { active: boolean }): Promise<Customer> {
  return apiRequest<Customer>(`/api/customers/${id}`, { method: 'PATCH', body: input });
}
