import { apiRequest } from '@/api/client';
import type { Sale, SaleSummary } from '@/api/types';

export function listSales(): Promise<SaleSummary[]> {
  return apiRequest<SaleSummary[]>('/api/sales');
}

export function getSale(id: string): Promise<Sale> {
  return apiRequest<Sale>(`/api/sales/${id}`);
}

export type CreateSaleItemInput = {
  productId: string;
  quantity: number;
};

export type CreateSaleInput = {
  customerId: string;
  items: CreateSaleItemInput[];
};

export function createSale(input: CreateSaleInput): Promise<Sale> {
  return apiRequest<Sale>('/api/sales', { method: 'POST', body: input });
}

export function cancelSale(id: string): Promise<Sale> {
  return apiRequest<Sale>(`/api/sales/${id}/cancel`, { method: 'POST' });
}
