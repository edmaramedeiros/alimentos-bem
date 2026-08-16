import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { createCustomer } from '@/api/customers';
import { CustomerForm, type CustomerFormData } from '@/components/customer-form';

export default function NewCustomerScreen() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await createCustomer({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        addressLine: data.addressLine || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip: data.zip || undefined,
        notes: data.notes || undefined,
        whatsappOptIn: data.whatsappOptIn,
      });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.back();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível cadastrar o cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Novo cliente
      </Text>
      <CustomerForm onSubmit={onSubmit} submitting={submitting} serverError={serverError} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 16 },
});
