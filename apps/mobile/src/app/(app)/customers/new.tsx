import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { createCustomer, getDefaultLocation } from '@/api/customers';
import { CustomerForm, type CustomerFormData } from '@/components/customer-form';

export default function NewCustomerScreen() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sugere o município/UF mais usado pelo próprio vendedor nos cadastros
  // anteriores, pra não precisar selecionar de novo toda hora.
  const defaultLocationQuery = useQuery({ queryKey: ['customers', 'default-location'], queryFn: getDefaultLocation });

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
        grupo: data.grupo || undefined,
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

  if (defaultLocationQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Novo cliente
      </Text>
      <CustomerForm
        defaultValues={{
          state: defaultLocationQuery.data?.state ?? '',
          city: defaultLocationQuery.data?.city ?? '',
        }}
        onSubmit={onSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginBottom: 16 },
});
