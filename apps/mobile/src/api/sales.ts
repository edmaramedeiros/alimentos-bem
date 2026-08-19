import { apiRequest } from '@/api/client';
import type { DailySalesPoint, MonthlySalesPoint, Payment, PaymentMethod, Sale, SaleSummary } from '@/api/types';

export function listSales(): Promise<SaleSummary[]> {
  return apiRequest<SaleSummary[]>('/api/sales');
}

export function getMonthlySales(vendedorId?: string): Promise<MonthlySalesPoint[]> {
  const query = vendedorId ? `?vendedorId=${vendedorId}` : '';
  return apiRequest<MonthlySalesPoint[]>(`/api/sales/dashboard/monthly${query}`);
}

export function getDailySales(month: string, vendedorId?: string): Promise<DailySalesPoint[]> {
  const query = vendedorId ? `&vendedorId=${vendedorId}` : '';
  return apiRequest<DailySalesPoint[]>(`/api/sales/dashboard/daily?month=${month}${query}`);
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

export function markSaleAsDelivered(id: string): Promise<Sale> {
  return apiRequest<Sale>(`/api/sales/${id}/deliver`, { method: 'POST' });
}

export function listPayments(saleId: string): Promise<Payment[]> {
  return apiRequest<Payment[]>(`/api/sales/${saleId}/payments`);
}

export function registerPayment(saleId: string, paymentMethod: PaymentMethod, notes?: string): Promise<Sale> {
  return apiRequest<Sale>(`/api/sales/${saleId}/payments`, {
    method: 'POST',
    body: { paymentMethod, notes },
  });
}
