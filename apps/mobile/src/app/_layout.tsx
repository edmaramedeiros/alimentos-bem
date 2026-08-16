import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { useAuthStore } from '@/store/auth-store';
import { paperDarkTheme, paperLightTheme } from '@/theme/paper-theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const theme = colorScheme === 'dark' ? paperDarkTheme : paperLightTheme;

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(app)" />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
