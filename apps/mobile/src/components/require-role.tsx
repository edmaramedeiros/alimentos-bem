import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import type { Role } from '@/api/types';
import { useAuthStore } from '@/store/auth-store';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== role) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}
