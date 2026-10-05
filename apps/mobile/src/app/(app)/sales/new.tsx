import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { ApiError } from '@/api/client';
import { createSale } from '@/api/sales';
import { SaleForm, type SaleFormValues } from '@/components/sale-form';

export default function NewSaleScreen() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (values: SaleFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const sale = await createSale(values);
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      router.replace(`/sales/${sale.id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível lançar a venda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SaleForm
      title="Nova venda"
      onSubmit={onSubmit}
      submitting={submitting}
      serverError={serverError}
      submitLabel="Finalizar venda"
    />
  );
}
