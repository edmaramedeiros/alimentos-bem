import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text } from 'react-native-paper';

import { listProducts } from '@/api/products';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrencyBRL } from '@/utils/format';

export default function ProductsScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => listProducts(),
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }, [queryClient])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar os produtos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.active ? item.unit : `${item.unit} · inativo`}
            right={() => <Text style={styles.price}>{formatCurrencyBRL(item.currentPrice)}</Text>}
            onPress={() => router.push(`/products/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto cadastrado ainda.</Text>}
      />
      {isAdmin && (
        <FAB icon="plus" style={styles.fab} label="Novo produto" onPress={() => router.push('/products/new')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  price: { alignSelf: 'center', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
