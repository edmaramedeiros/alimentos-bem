import { apiRequest } from '@/api/client';
import type { LoginResponse } from '@/api/types';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    authenticated: false,
  });
}
