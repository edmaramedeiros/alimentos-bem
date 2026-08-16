import { apiRequest } from '@/api/client';
import type { PriceHistoryEntry, Product } from '@/api/types';

export function listProducts(active?: boolean): Promise<Product[]> {
  const query = active === undefined ? '' : `?active=${active}`;
  return apiRequest<Product[]>(`/api/products${query}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/api/products/${id}`);
}

export type CreateProductInput = {
  name: string;
  sku?: string;
  description?: string;
  unit: string;
  price: number;
};

export function createProduct(input: CreateProductInput): Promise<Product> {
  return apiRequest<Product>('/api/products', { method: 'POST', body: input });
}

export type UpdateProductInput = {
  name: string;
  sku?: string;
  description?: string;
  unit: string;
  active: boolean;
};

export function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return apiRequest<Product>(`/api/products/${id}`, { method: 'PATCH', body: input });
}

export function deactivateProduct(id: string): Promise<void> {
  return apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' });
}

export function getPriceHistory(id: string): Promise<PriceHistoryEntry[]> {
  return apiRequest<PriceHistoryEntry[]>(`/api/products/${id}/price-history`);
}

export function setProductPrice(id: string, price: number): Promise<PriceHistoryEntry> {
  return apiRequest<PriceHistoryEntry>(`/api/products/${id}/price-history`, {
    method: 'POST',
    body: { price },
  });
}
