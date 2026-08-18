import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, FAB, List, Menu, Text } from 'react-native-paper';

import { listSales } from '@/api/sales';
import type { SaleStatus } from '@/api/types';
import { formatCurrencyBRL, formatDateTimeBR, saleStatusLabel } from '@/utils/format';

const STATUS_OPTIONS: SaleStatus[] = ['AWAITING_DELIVERY', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED'];

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

  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | null>(null);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const customerOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const sale of data ?? []) {
      byId.set(sale.customerId, sale.customerName);
    }
    return Array.from(byId.entries()).sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const filteredSales = useMemo(() => {
    return (data ?? []).filter((sale) => {
      if (customerFilter && sale.customerId !== customerFilter) return false;
      if (statusFilter && sale.status !== statusFilter) return false;
      return true;
    });
  }, [data, customerFilter, statusFilter]);

  const selectedCustomerName = customerFilter ? customerOptions.find(([id]) => id === customerFilter)?.[1] : null;

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
      <View style={styles.filters}>
        <Menu
          visible={customerMenuVisible}
          onDismiss={() => setCustomerMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCustomerMenuVisible(true)} style={styles.filterButton}>
              {selectedCustomerName ? `Cliente: ${selectedCustomerName}` : 'Cliente: todos'}
            </Button>
          }
        >
          <Menu.Item
            title="Todos"
            onPress={() => {
              setCustomerFilter(null);
              setCustomerMenuVisible(false);
            }}
          />
          {customerOptions.map(([id, name]) => (
            <Menu.Item
              key={id}
              title={name}
              onPress={() => {
                setCustomerFilter(id);
                setCustomerMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={styles.filterButton}>
              {statusFilter ? `Situação: ${saleStatusLabel(statusFilter)}` : 'Situação: todas'}
            </Button>
          }
        >
          <Menu.Item
            title="Todas"
            onPress={() => {
              setStatusFilter(null);
              setStatusMenuVisible(false);
            }}
          />
          {STATUS_OPTIONS.map((status) => (
            <Menu.Item
              key={status}
              title={saleStatusLabel(status)}
              onPress={() => {
                setStatusFilter(status);
                setStatusMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredSales}
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
        ListEmptyComponent={
          <Text style={styles.empty}>
            {data && data.length > 0 ? 'Nenhuma venda encontrada com esses filtros.' : 'Nenhuma venda lançada ainda.'}
          </Text>
        }
      />
      <FAB icon="plus" style={styles.fab} label="Nova venda" onPress={() => router.push('/sales/new')} />
    </View>
  );
}

function statusChipStyle(status: string) {
  if (status === 'PAID') return { backgroundColor: '#C6C664' };
  if (status === 'CANCELLED') return { backgroundColor: '#DC9251' };
  if (status === 'AWAITING_DELIVERY') return { backgroundColor: '#ECCFB1' };
  return { backgroundColor: '#F4EFEB' };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  filterButton: { flexShrink: 1 },
  rightColumn: { alignItems: 'flex-end', gap: 4, justifyContent: 'center' },
  total: { fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
