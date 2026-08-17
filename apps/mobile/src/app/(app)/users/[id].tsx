import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, HelperText, List, Portal, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { getCommissionRateHistory, getUser, setCommissionRate } from '@/api/users';
import { RequireRole } from '@/components/require-role';
import { formatDateTimeBR, formatPercent } from '@/utils/format';

function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const userQuery = useQuery({ queryKey: ['users', id], queryFn: () => getUser(id) });
  const rateHistoryQuery = useQuery({
    queryKey: ['users', id, 'commission-rate-history'],
    queryFn: () => getCommissionRateHistory(id),
  });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [rateInput, setRateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const submitRate = async () => {
    const parsed = Number(rateInput.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setRateError('Informe uma taxa entre 0 e 100');
      return;
    }
    setSaving(true);
    setRateError(null);
    try {
      await setCommissionRate(id, parsed);
      await queryClient.invalidateQueries({ queryKey: ['users', id, 'commission-rate-history'] });
      setDialogVisible(false);
      setRateInput('');
    } catch (error) {
      setRateError(error instanceof ApiError ? error.message : 'Não foi possível salvar a taxa.');
    } finally {
      setSaving(false);
    }
  };

  if (userQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!userQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Usuário não encontrado.</Text>
      </View>
    );
  }

  const user = userQuery.data;
  const currentRate = rateHistoryQuery.data?.find((entry) => entry.effectiveTo === null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">{user.name}</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {user.email} · {user.role === 'ADMIN' ? 'Administradora' : 'Vendedora'}
        {user.active ? '' : ' · inativo'}
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Comissão atual
      </Text>
      <Text variant="headlineMedium">{currentRate ? formatPercent(currentRate.rate) : 'Não configurada'}</Text>
      <Button mode="outlined" style={styles.setRateButton} onPress={() => setDialogVisible(true)}>
        Alterar taxa de comissão
      </Button>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Histórico de comissão
      </Text>
      {rateHistoryQuery.data?.map((entry) => (
        <List.Item
          key={entry.id}
          title={formatPercent(entry.rate)}
          description={
            entry.effectiveTo
              ? `${formatDateTimeBR(entry.effectiveFrom)} até ${formatDateTimeBR(entry.effectiveTo)}`
              : `Desde ${formatDateTimeBR(entry.effectiveFrom)} · vigente`
          }
        />
      ))}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Alterar taxa de comissão</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nova taxa (%)"
              mode="outlined"
              keyboardType="decimal-pad"
              value={rateInput}
              onChangeText={setRateInput}
              error={!!rateError}
            />
            <HelperText type="error" visible={!!rateError}>
              {rateError}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={submitRate} loading={saving} disabled={saving}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

export default function UserDetailScreen() {
  return (
    <RequireRole role="ADMIN">
      <UserDetail />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { opacity: 0.7, marginTop: 4 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  setRateButton: { marginTop: 12, alignSelf: 'flex-start' },
});
