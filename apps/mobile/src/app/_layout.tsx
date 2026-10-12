import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { useAuthStore } from '@/store/auth-store';
import { paperLightTheme } from '@/theme/paper-theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  // As telas usam as cores da marca (creme/oliva) fixas no código, não o tema do
  // Paper — então seguir o modo escuro do aparelho deixava a interface misturada
  // (alguns componentes escuros, outros claros). Mantemos sempre o tema claro.
  const theme = paperLightTheme;
  const pathname = usePathname();

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  useEffect(() => {
    // Expo Router's web title sync sets an empty <title> when headerShown is false;
    // the browser uses the first <title> in the document, so we set it imperatively here.
    if (Platform.OS === 'web') {
      document.title = 'Edmara Medeiros - alimentos do bem';
    }
  }, [pathname]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme} settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}>
        <PwaInstallPrompt />
        <Stack screenOptions={{ headerShown: false, title: 'Edmara Medeiros' }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(app)" />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
