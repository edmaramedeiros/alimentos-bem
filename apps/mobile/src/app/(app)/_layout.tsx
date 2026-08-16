import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function AppLayout() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
