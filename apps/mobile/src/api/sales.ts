import { apiRequest } from '@/api/client';
import type {
  DailySalesPoint,
  MonthlySalesPoint,
  Payment,
  PaymentAttachment,
  PaymentMethod,
  Sale,
  SaleSummary,
} from '@/api/types';

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
  customerId: string | null;
  items: CreateSaleItemInput[];
  discountAmount?: number;
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

export type RegisterPaymentInput = {
  paymentMethod: PaymentMethod;
  notes?: string;
  attachmentBase64?: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
};

export function registerPayment(saleId: string, input: RegisterPaymentInput): Promise<Sale> {
  return apiRequest<Sale>(`/api/sales/${saleId}/payments`, {
    method: 'POST',
    body: input,
  });
}

export function getPaymentAttachment(saleId: string, paymentId: string): Promise<PaymentAttachment> {
  return apiRequest<PaymentAttachment>(`/api/sales/${saleId}/payments/${paymentId}/attachment`);
}
