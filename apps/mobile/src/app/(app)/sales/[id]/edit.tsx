import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { getCustomer } from '@/api/customers';
import { getSale, updateSale } from '@/api/sales';
import { SaleForm, type SaleFormValues } from '@/components/sale-form';

export default function EditSaleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const saleQuery = useQuery({ queryKey: ['sales', id], queryFn: () => getSale(id) });
  const customerQuery = useQuery({
    queryKey: ['customers', saleQuery.data?.customerId],
    queryFn: () => getCustomer(saleQuery.data!.customerId!),
    enabled: !!saleQuery.data?.customerId,
  });

  const onSubmit = async (values: SaleFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateSale(id, values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales', id] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
      ]);
      router.replace(`/sales/${id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSubmitting(false);
    }
  };

  if (saleQuery.isLoading || (saleQuery.data?.customerId && customerQuery.isLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const sale = saleQuery.data;
  if (!sale) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text>Venda não encontrada.</Text>
        <Button onPress={() => router.back()}>Voltar</Button>
      </View>
    );
  }

  if (sale.status === 'PAID' || sale.status === 'CANCELLED') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text>Esta venda não pode mais ser editada.</Text>
        <Button onPress={() => router.replace(`/sales/${id}`)}>Voltar</Button>
      </View>
    );
  }

  return (
    <SaleForm
      title="Editar venda"
      initialCustomer={customerQuery.data ?? null}
      initialIsConsumer={!sale.customerId}
      initialQuantities={Object.fromEntries(sale.items.map((item) => [item.productId, item.quantity]))}
      initialDiscountAmount={sale.discountAmount}
      initialGeneratesCashback={sale.generatesCashback}
      onSubmit={onSubmit}
      submitting={submitting}
      serverError={serverError}
      submitLabel="Salvar alterações"
    />
  );
}
