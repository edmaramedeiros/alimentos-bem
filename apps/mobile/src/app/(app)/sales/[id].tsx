import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, List, Portal, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { cancelSale, getSale } from '@/api/sales';
import { formatCurrencyBRL, formatDateTimeBR, saleStatusLabel } from '@/utils/format';

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const saleQuery = useQuery({ queryKey: ['sales', id], queryFn: () => getSale(id) });

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelSale(id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales', id] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
      ]);
      setConfirmVisible(false);
    } catch (error) {
      setCancelError(error instanceof ApiError ? error.message : 'Não foi possível cancelar a venda.');
    } finally {
      setCancelling(false);
    }
  };

  if (saleQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!saleQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Venda não encontrada.</Text>
      </View>
    );
  }

  const sale = saleQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">{sale.customerName}</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {formatDateTimeBR(sale.saleDate)} · lançada por {sale.vendedorName}
      </Text>
      <Chip style={styles.statusChip}>{saleStatusLabel(sale.status)}</Chip>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Itens
      </Text>
      {sale.items.map((item) => (
        <List.Item
          key={item.id}
          title={item.productName}
          description={`${item.quantity} ${item.unit} × ${formatCurrencyBRL(item.unitPrice)}`}
          right={() => <Text style={styles.subtotal}>{formatCurrencyBRL(item.subtotal)}</Text>}
        />
      ))}

      <View style={styles.totalRow}>
        <Text variant="titleMedium">Total</Text>
        <Text variant="titleMedium">{formatCurrencyBRL(sale.totalAmount)}</Text>
      </View>

      {sale.status === 'PENDING' && (
        <Button mode="outlined" textColor="#A74C39" style={styles.cancelButton} onPress={() => setConfirmVisible(true)}>
          Cancelar venda
        </Button>
      )}

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Cancelar venda?</Dialog.Title>
          <Dialog.Content>
            <Text>Essa ação não pode ser desfeita.</Text>
            {cancelError ? <Text style={styles.errorText}>{cancelError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)} disabled={cancelling}>
              Voltar
            </Button>
            <Button onPress={handleCancel} loading={cancelling} disabled={cancelling} textColor="#A74C39">
              Confirmar cancelamento
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { opacity: 0.7, marginTop: 4 },
  statusChip: { alignSelf: 'flex-start', marginTop: 12 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  subtotal: { alignSelf: 'center', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ECCFB1' },
  cancelButton: { marginTop: 32 },
  errorText: { color: '#A74C39', marginTop: 8 },
});
