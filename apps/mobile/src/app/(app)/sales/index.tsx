import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, FAB, List, Menu, Portal, Searchbar, Text } from 'react-native-paper';

import { listSales } from '@/api/sales';
import type { SaleStatus } from '@/api/types';
import { VendedorPicker } from '@/components/vendedor-picker';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrencyBRL, formatDateTimeBR, saleStatusLabel } from '@/utils/format';

const STATUS_OPTIONS: SaleStatus[] = ['AWAITING_DELIVERY', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED'];

// Vendas para "Consumidor" têm customerId null; usa um sentinel distinto de null
// (que já significa "sem filtro") para poder filtrar só por elas na busca.
const CONSUMER_FILTER = '__consumer__';

export default function SalesScreen() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
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
  const [vendedorFilter, setVendedorFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | null>(null);
  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const customerOptions = useMemo(() => {
    const byId = new Map<string, string>();
    let hasConsumerSale = false;
    for (const sale of data ?? []) {
      if (sale.customerId) {
        byId.set(sale.customerId, sale.customerName);
      } else {
        hasConsumerSale = true;
      }
    }
    const options = Array.from(byId.entries()).sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR'));
    if (hasConsumerSale) {
      options.push([CONSUMER_FILTER, 'Consumidor']);
    }
    return options;
  }, [data]);

  const filteredCustomerOptions = useMemo(() => {
    const normalized = customerSearch.trim().toLowerCase();
    if (!normalized) return customerOptions;
    return customerOptions.filter(([, name]) => name.toLowerCase().includes(normalized));
  }, [customerOptions, customerSearch]);

  const filteredSales = useMemo(() => {
    return (data ?? []).filter((sale) => {
      if (customerFilter === CONSUMER_FILTER) {
        if (sale.customerId !== null) return false;
      } else if (customerFilter && sale.customerId !== customerFilter) {
        return false;
      }
      if (vendedorFilter && sale.vendedorId !== vendedorFilter) return false;
      if (statusFilter && sale.status !== statusFilter) return false;
      return true;
    });
  }, [data, customerFilter, vendedorFilter, statusFilter]);

  const selectedCustomerName = customerFilter ? customerOptions.find(([id]) => id === customerFilter)?.[1] : null;

  const openCustomerDialog = () => {
    setCustomerSearch('');
    setCustomerDialogVisible(true);
  };

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
        <Button mode="outlined" onPress={openCustomerDialog} style={styles.filterButton}>
          {selectedCustomerName ? `Cliente: ${selectedCustomerName}` : 'Cliente: todos'}
        </Button>

        {isAdmin && <VendedorPicker value={vendedorFilter} onChange={setVendedorFilter} />}

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

      <Portal>
        <Dialog visible={customerDialogVisible} onDismiss={() => setCustomerDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>Filtrar por cliente</Dialog.Title>
          <View style={styles.searchWrapper}>
            <Searchbar placeholder="Buscar por nome" value={customerSearch} onChangeText={setCustomerSearch} />
          </View>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <FlatList
              data={filteredCustomerOptions}
              keyExtractor={([id]) => id}
              ListHeaderComponent={
                <List.Item
                  title="Todos"
                  onPress={() => {
                    setCustomerFilter(null);
                    setCustomerDialogVisible(false);
                  }}
                />
              }
              renderItem={({ item: [id, name] }) => (
                <List.Item
                  title={name}
                  onPress={() => {
                    setCustomerFilter(id);
                    setCustomerDialogVisible(false);
                  }}
                />
              )}
              ListEmptyComponent={<Text style={styles.emptyDialog}>Nenhum cliente encontrado.</Text>}
            />
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCustomerDialogVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dialog: { maxHeight: '80%' },
  searchWrapper: { paddingHorizontal: 24, paddingBottom: 8 },
  dialogScroll: { maxHeight: 400 },
  emptyDialog: { padding: 16, opacity: 0.6 },
});
