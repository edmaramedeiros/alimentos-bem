import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';

import { getPickingList } from '@/api/sales';
import { VendedorPicker } from '@/components/vendedor-picker';
import { useAuthStore } from '@/store/auth-store';
import { formatDateTimeBR } from '@/utils/format';

function formatQuantity(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

export default function PickingListScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const [vendedorId, setVendedorId] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: ['sales', 'picking-list', vendedorId ?? 'all'],
    queryFn: () => getPickingList(vendedorId),
  });

  const products = query.data?.products ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
    >
      <Text variant="headlineSmall">Separação</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Produtos das vendas aguardando entrega
      </Text>

      {isAdmin && (
        <View style={styles.vendedorPicker}>
          <VendedorPicker value={vendedorId} onChange={setVendedorId} />
        </View>
      )}

      {query.isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : query.error || !query.data ? (
        <Text style={styles.empty}>Não foi possível carregar a lista de separação.</Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="labelMedium">Pedidos a entregar</Text>
                <Text variant="headlineMedium">{query.data.orderCount}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="labelMedium">Produtos diferentes</Text>
                <Text variant="headlineMedium">{products.length}</Text>
              </Card.Content>
            </Card>
          </View>

          {products.length === 0 ? (
            <Text style={styles.empty}>Nenhuma venda aguardando entrega.</Text>
          ) : (
            <Card>
              {products.map((product) => (
                <List.Accordion
                  key={product.productId}
                  title={product.productName}
                  description={`${product.orders.length} ${product.orders.length === 1 ? 'pedido' : 'pedidos'}${product.category ? ` · ${product.category}` : ''}`}
                  right={() => (
                    <Text variant="titleMedium" style={styles.total}>
                      {formatQuantity(product.totalQuantity)} {product.unit}
                    </Text>
                  )}
                >
                  {product.orders.map((order) => (
                    <List.Item
                      key={order.saleId}
                      title={order.customerName}
                      description={`${formatDateTimeBR(order.saleDate)}${isAdmin ? ` · ${order.vendedorName}` : ''}`}
                      onPress={() => router.push(`/sales/${order.saleId}` as never)}
                      right={() => (
                        <Text style={styles.orderQuantity}>
                          {formatQuantity(order.quantity)} {product.unit}
                        </Text>
                      )}
                    />
                  ))}
                </List.Accordion>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  vendedorPicker: { alignSelf: 'flex-start', marginBottom: 16 },
  loading: { marginVertical: 24 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1 },
  total: { alignSelf: 'center', fontWeight: '600' },
  orderQuantity: { alignSelf: 'center' },
  empty: { textAlign: 'center', marginTop: 16, opacity: 0.6 },
});
