import { apiRequest } from '@/api/client';
import type { Customer, WhatsappBroadcast, WhatsappBroadcastRecipient, WhatsappSessionStatus } from '@/api/types';

export function previewRecipients(cityFilter: string, nameFilter: string): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (cityFilter) params.set('city', cityFilter);
  if (nameFilter) params.set('name', nameFilter);
  const query = params.toString();
  return apiRequest<Customer[]>(`/api/whatsapp/customers/preview${query ? `?${query}` : ''}`);
}

export type CreateCampaignInput = {
  message: string;
  attachmentBase64?: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  cityFilter?: string;
  nameFilter?: string;
  delaySeconds: number;
};

export function createCampaign(input: CreateCampaignInput): Promise<WhatsappBroadcast> {
  return apiRequest<WhatsappBroadcast>('/api/whatsapp/campaigns', { method: 'POST', body: input });
}

export function listCampaigns(): Promise<WhatsappBroadcast[]> {
  return apiRequest<WhatsappBroadcast[]>('/api/whatsapp/campaigns');
}

export function getCampaign(id: string): Promise<WhatsappBroadcast> {
  return apiRequest<WhatsappBroadcast>(`/api/whatsapp/campaigns/${id}`);
}

export function listCampaignRecipients(id: string): Promise<WhatsappBroadcastRecipient[]> {
  return apiRequest<WhatsappBroadcastRecipient[]>(`/api/whatsapp/campaigns/${id}/recipients`);
}

export function getSessionStatus(): Promise<WhatsappSessionStatus> {
  return apiRequest<WhatsappSessionStatus>('/api/whatsapp/session/status');
}

export function getSessionQr(): Promise<{ qr: string | null }> {
  return apiRequest<{ qr: string | null }>('/api/whatsapp/session/qr');
}

export function disconnectSession(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>('/api/whatsapp/session/logout', { method: 'POST' });
}
