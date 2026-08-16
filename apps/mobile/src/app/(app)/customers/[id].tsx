import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, List, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { getCustomer, updateCustomer } from '@/api/customers';
import { CustomerForm, type CustomerFormData } from '@/components/customer-form';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const customerQuery = useQuery({ queryKey: ['customers', id], queryFn: () => getCustomer(id) });

  const onSubmit = async (data: CustomerFormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateCustomer(id, {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        addressLine: data.addressLine || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip: data.zip || undefined,
        notes: data.notes || undefined,
        whatsappOptIn: data.whatsappOptIn,
        active: customerQuery.data?.active ?? true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customers', id] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
      ]);
      setEditing(false);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSubmitting(false);
    }
  };

  if (customerQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (customerQuery.error) {
    const message =
      customerQuery.error instanceof ApiError && customerQuery.error.status === 403
        ? 'Este cliente pertence a outra vendedora — você não tem acesso.'
        : 'Não foi possível carregar este cliente.';
    return (
      <View style={styles.center}>
        <Text>{message}</Text>
        <Button onPress={() => router.back()} style={styles.backButton}>
          Voltar
        </Button>
      </View>
    );
  }

  const customer = customerQuery.data!;

  if (editing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Editar cliente
        </Text>
        <CustomerForm
          defaultValues={{
            name: customer.name,
            phone: customer.phone ?? '',
            email: customer.email ?? '',
            addressLine: customer.addressLine ?? '',
            city: customer.city ?? '',
            state: customer.state ?? '',
            zip: customer.zip ?? '',
            notes: customer.notes ?? '',
            whatsappOptIn: customer.whatsappOptIn,
          }}
          onSubmit={onSubmit}
          submitting={submitting}
          serverError={serverError}
        />
        <Button onPress={() => setEditing(false)} disabled={submitting}>
          Cancelar
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">{customer.name}</Text>
      <View style={styles.chipRow}>
        {customer.whatsappOptIn && <Chip icon="whatsapp">Aceita WhatsApp</Chip>}
        {!customer.active && <Chip>Inativo</Chip>}
      </View>

      <List.Item title="Telefone" description={customer.phone ?? '—'} />
      <List.Item title="E-mail" description={customer.email ?? '—'} />
      <List.Item
        title="Endereço"
        description={[customer.addressLine, customer.city, customer.state, customer.zip].filter(Boolean).join(', ') || '—'}
      />
      <List.Item title="Observações" description={customer.notes ?? '—'} />
      <List.Item title="Cadastrado por" description={customer.ownerVendedorName} />

      <Button mode="contained" onPress={() => setEditing(true)} style={styles.editButton}>
        Editar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { marginBottom: 16 },
  chipRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  editButton: { marginTop: 24 },
  backButton: { marginTop: 8 },
});
