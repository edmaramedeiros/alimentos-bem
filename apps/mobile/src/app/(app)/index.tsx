import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAuthStore } from '@/store/auth-store';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Olá, {user?.name}</Text>
      <Text variant="bodyMedium" style={styles.role}>
        {isAdmin ? 'Administradora' : 'Vendedora'}
      </Text>

      <Button mode="contained" onPress={() => router.push('/products')} style={styles.navButton}>
        Produtos
      </Button>

      <Button mode="contained" onPress={() => router.push('/customers')} style={styles.navButton}>
        Clientes
      </Button>

      <Button mode="contained" onPress={() => router.push('/sales')} style={styles.navButton}>
        Vendas
      </Button>

      <Button mode="contained" onPress={() => router.push('/commissions')} style={styles.navButton}>
        Comissões
      </Button>

      {isAdmin && (
        <Button mode="contained" onPress={() => router.push('/users')} style={styles.navButton}>
          Usuários
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  role: { opacity: 0.7, marginBottom: 24 },
  navButton: { alignSelf: 'flex-start' },
});
