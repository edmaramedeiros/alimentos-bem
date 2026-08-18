import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { useAuthStore } from '@/store/auth-store';

export default function AppLayout() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
