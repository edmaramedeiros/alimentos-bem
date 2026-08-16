import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAuthStore } from '@/store/auth-store';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Olá, {user?.name}</Text>
      <Text variant="bodyMedium" style={styles.role}>
        {user?.role === 'ADMIN' ? 'Administradora' : 'Vendedora'}
      </Text>
      <Button mode="outlined" onPress={logout} style={styles.button}>
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  role: { opacity: 0.7, marginBottom: 24 },
  button: { alignSelf: 'flex-start' },
});
