import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, IconButton, List, Portal, RadioButton, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { cancelSale, getPaymentAttachment, getSale, listPayments, markSaleAsDelivered, registerPayment } from '@/api/sales';
import type { PaymentMethod } from '@/api/types';
import { formatCurrencyBRL, formatDateTimeBR, formatPercent, paymentMethodLabel, saleStatusLabel } from '@/utils/format';
import { openAttachment, openAttachmentWindow } from '@/utils/open-attachment';
import { readAssetAsBase64 } from '@/utils/read-file-base64';

const PAYMENT_METHODS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'OUTRO'];

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [delivering, setDelivering] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [registering, setRegistering] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);
  const [attachmentViewError, setAttachmentViewError] = useState<string | null>(null);

  const saleQuery = useQuery({ queryKey: ['sales', id], queryFn: () => getSale(id) });
  const paymentsQuery = useQuery({
    queryKey: ['sales', id, 'payments'],
    queryFn: () => listPayments(id),
    enabled: saleQuery.data?.status === 'PAID',
  });

  const invalidateSale = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['sales', id] }),
      queryClient.invalidateQueries({ queryKey: ['sales'] }),
    ]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelSale(id);
      await invalidateSale();
      setConfirmVisible(false);
    } catch (error) {
      setCancelError(error instanceof ApiError ? error.message : 'Não foi possível cancelar a venda.');
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    setDelivering(true);
    setDeliverError(null);
    try {
      await markSaleAsDelivered(id);
      await invalidateSale();
    } catch (error) {
      setDeliverError(error instanceof ApiError ? error.message : 'Não foi possível marcar como entregue.');
    } finally {
      setDelivering(false);
    }
  };

  const pickPaymentAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
    if (result.canceled || !result.assets?.length) return;
    setAttachment(result.assets[0]);
  };

  const handleRegisterPayment = async () => {
    setRegistering(true);
    setPaymentError(null);
    try {
      let attachmentBase64: string | undefined;
      if (attachment) {
        attachmentBase64 = await readAssetAsBase64(attachment);
      }
      await registerPayment(id, {
        paymentMethod,
        attachmentBase64,
        attachmentFileName: attachment?.name,
        attachmentMimeType: attachment?.mimeType,
      });
      await Promise.all([invalidateSale(), queryClient.invalidateQueries({ queryKey: ['commissions'] })]);
      setPaymentDialogVisible(false);
      setAttachment(null);
    } catch (error) {
      setPaymentError(error instanceof ApiError ? error.message : 'Não foi possível registrar o pagamento.');
    } finally {
      setRegistering(false);
    }
  };

  const handleViewAttachment = async (paymentId: string, fileName: string) => {
    const targetWindow = openAttachmentWindow();
    setOpeningAttachmentId(paymentId);
    setAttachmentViewError(null);
    try {
      const attachmentData = await getPaymentAttachment(id, paymentId);
      await openAttachment(attachmentData.dataBase64, fileName, attachmentData.mimeType, targetWindow);
    } catch (error) {
      targetWindow?.close();
      setAttachmentViewError(error instanceof ApiError ? error.message : 'Não foi possível abrir o comprovante.');
    } finally {
      setOpeningAttachmentId(null);
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
  const canCancel = sale.status === 'AWAITING_DELIVERY' || sale.status === 'AWAITING_PAYMENT';

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

      {sale.discountAmount > 0 && (
        <View style={styles.discountRow}>
          <Text variant="bodyMedium" style={styles.muted}>
            Desconto
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            -{formatCurrencyBRL(sale.discountAmount)}
          </Text>
        </View>
      )}

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

      {sale.status === 'PAID' && paymentsQuery.data?.[0]?.hasAttachment && (
        <View style={styles.attachmentRow}>
          <Text variant="bodyMedium" style={styles.muted}>
            Comprovante: {paymentsQuery.data[0].attachmentFileName}
          </Text>
          <Button
            compact
            mode="text"
            onPress={() => handleViewAttachment(paymentsQuery.data[0].id, paymentsQuery.data[0].attachmentFileName ?? 'comprovante')}
            loading={openingAttachmentId === paymentsQuery.data[0].id}
            disabled={openingAttachmentId === paymentsQuery.data[0].id}
          >
            Ver
          </Button>
        </View>
      )}
      {attachmentViewError ? <Text style={styles.errorText}>{attachmentViewError}</Text> : null}

      {sale.status === 'AWAITING_DELIVERY' && (
        <>
          <Button mode="contained" style={styles.payButton} onPress={handleMarkAsDelivered} loading={delivering} disabled={delivering}>
            Marcar como entregue
          </Button>
          {deliverError ? <Text style={styles.errorText}>{deliverError}</Text> : null}
        </>
      )}

      {sale.status === 'AWAITING_PAYMENT' && (
        <Button mode="contained" style={styles.payButton} onPress={() => setPaymentDialogVisible(true)}>
          Marcar como recebido
        </Button>
      )}

      {canCancel && (
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

            <Text variant="bodyMedium" style={styles.attachmentLabel}>
              Comprovante (opcional)
            </Text>
            {attachment ? (
              <View style={styles.attachmentPickedRow}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name}
                </Text>
                <IconButton icon="close" size={18} onPress={() => setAttachment(null)} accessibilityLabel="Remover anexo" />
              </View>
            ) : (
              <Button mode="outlined" onPress={pickPaymentAttachment} icon="paperclip" style={styles.attachmentPickButton}>
                Escolher imagem ou PDF
              </Button>
            )}

            {paymentError ? <Text style={styles.errorText}>{paymentError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setPaymentDialogVisible(false);
                setAttachment(null);
              }}
              disabled={registering}
            >
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
  discountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECCFB1',
  },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  payButton: { marginTop: 24 },
  cancelButton: { marginTop: 12 },
  errorText: { color: '#A74C39', marginTop: 8 },
  attachmentLabel: { marginTop: 16, marginBottom: 4 },
  attachmentPickButton: { alignSelf: 'flex-start' },
  attachmentPickedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ECCFB1',
    borderRadius: 8,
  },
  attachmentName: { flex: 1 },
});
