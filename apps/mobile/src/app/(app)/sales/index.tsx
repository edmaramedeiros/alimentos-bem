import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, List, Text } from 'react-native-paper';

import { listSales } from '@/api/sales';
import { formatCurrencyBRL, formatDateTimeBR, saleStatusLabel } from '@/utils/format';

export default function SalesScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: listSales,
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
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
        <Text>Não foi possível carregar as vendas.</Text>
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
            title={item.customerName}
            description={`${formatDateTimeBR(item.saleDate)} · ${item.itemCount} ${item.itemCount === 1 ? 'item' : 'itens'}${
              item.vendedorName ? ` · ${item.vendedorName}` : ''
            }`}
            onPress={() => router.push(`/sales/${item.id}`)}
            right={() => (
              <View style={styles.rightColumn}>
                <Text style={styles.total}>{formatCurrencyBRL(item.totalAmount)}</Text>
                <Chip compact style={statusChipStyle(item.status)}>
                  {saleStatusLabel(item.status)}
                </Chip>
              </View>
            )}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma venda lançada ainda.</Text>}
      />
      <FAB icon="plus" style={styles.fab} label="Nova venda" onPress={() => router.push('/sales/new')} />
    </View>
  );
}

function statusChipStyle(status: string) {
  if (status === 'PAID') return { backgroundColor: '#C6C664' };
  if (status === 'CANCELLED') return { backgroundColor: '#ECCFB1' };
  return { backgroundColor: '#F4EFEB' };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rightColumn: { alignItems: 'flex-end', gap: 4, justifyContent: 'center' },
  total: { fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
