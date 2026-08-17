import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, List, Portal, RadioButton, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { cancelSale, getSale, registerPayment } from '@/api/sales';
import type { PaymentMethod } from '@/api/types';
import { formatCurrencyBRL, formatDateTimeBR, formatPercent, paymentMethodLabel, saleStatusLabel } from '@/utils/format';

const PAYMENT_METHODS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'OUTRO'];

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [registering, setRegistering] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const handleRegisterPayment = async () => {
    setRegistering(true);
    setPaymentError(null);
    try {
      await registerPayment(id, paymentMethod);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales', id] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['commissions'] }),
      ]);
      setPaymentDialogVisible(false);
    } catch (error) {
      setPaymentError(error instanceof ApiError ? error.message : 'Não foi possível registrar o pagamento.');
    } finally {
      setRegistering(false);
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

      {sale.commissionStatus === 'EARNED' && sale.commissionAmount !== null && (
        <View style={styles.commissionRow}>
          <Text variant="bodyMedium" style={styles.muted}>
            Comissão ({formatPercent(sale.commissionRateApplied ?? 0)})
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {formatCurrencyBRL(sale.commissionAmount)}
          </Text>
        </View>
      )}

      {sale.status === 'PENDING' && (
        <>
          <Button mode="contained" style={styles.payButton} onPress={() => setPaymentDialogVisible(true)}>
            Marcar como recebido
          </Button>
          <Button mode="outlined" textColor="#A74C39" style={styles.cancelButton} onPress={() => setConfirmVisible(true)}>
            Cancelar venda
          </Button>
        </>
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

      <Portal>
        <Dialog visible={paymentDialogVisible} onDismiss={() => setPaymentDialogVisible(false)}>
          <Dialog.Title>Registrar recebimento</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.muted}>Valor recebido: {formatCurrencyBRL(sale.totalAmount)}</Text>
            <RadioButton.Group onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} value={paymentMethod}>
              {PAYMENT_METHODS.map((method) => (
                <RadioButton.Item key={method} label={paymentMethodLabel(method)} value={method} />
              ))}
            </RadioButton.Group>
            {paymentError ? <Text style={styles.errorText}>{paymentError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaymentDialogVisible(false)} disabled={registering}>
              Cancelar
            </Button>
            <Button onPress={handleRegisterPayment} loading={registering} disabled={registering}>
              Confirmar
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECCFB1',
  },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  payButton: { marginTop: 24 },
  cancelButton: { marginTop: 12 },
  errorText: { color: '#A74C39', marginTop: 8 },
});
