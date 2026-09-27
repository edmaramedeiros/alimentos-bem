import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { getCashbackConfig, setCashbackConfig } from '@/api/cashback';
import { RequireRole } from '@/components/require-role';
import { formatDateTimeBR, formatPercent } from '@/utils/format';

function CashbackConfigScreen() {
  const queryClient = useQueryClient();
  const configQuery = useQuery({ queryKey: ['cashback', 'config'], queryFn: getCashbackConfig });

  const [percentageInput, setPercentageInput] = useState('');
  const [validityInput, setValidityInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setPercentageInput(configQuery.data?.percentage != null ? String(configQuery.data.percentage) : '');
    setValidityInput(configQuery.data?.validityDays != null ? String(configQuery.data.validityDays) : '');
    setError(null);
    setEditing(true);
  };

  const submit = async () => {
    const percentage = Number(percentageInput.replace(',', '.'));
    const validityDays = Number(validityInput.replace(',', '.'));
    if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
      setError('Informe um percentual entre 0,01 e 100');
      return;
    }
    if (!Number.isInteger(validityDays) || validityDays <= 0) {
      setError('Informe uma validade em dias, maior que zero');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await setCashbackConfig({ percentage, validityDays });
      await queryClient.invalidateQueries({ queryKey: ['cashback', 'config'] });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a configuração.');
    } finally {
      setSaving(false);
    }
  };

  if (configQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const config = configQuery.data;
  const configured = config?.percentage != null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Cashback
      </Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Percentual e validade aplicados às vendas marcadas como "gera cashback". Mudar aqui só afeta vendas novas — vendas já
        lançadas mantêm o percentual e a validade que estavam vigentes quando foram criadas.
      </Text>

      {editing ? (
        <View style={styles.form}>
          <TextInput
            label="Percentual (%)"
            mode="outlined"
            keyboardType="decimal-pad"
            value={percentageInput}
            onChangeText={setPercentageInput}
            style={styles.input}
          />
          <TextInput
            label="Validade (dias)"
            mode="outlined"
            keyboardType="number-pad"
            value={validityInput}
            onChangeText={setValidityInput}
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          <View style={styles.formButtons}>
            <Button onPress={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={submit} loading={saving} disabled={saving}>
              Salvar
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.summary}>
          {configured ? (
            <>
              <Text variant="headlineMedium">{formatPercent(config!.percentage!)}</Text>
              <Text variant="bodyMedium" style={styles.muted}>
                Válido por {config!.validityDays} dia{config!.validityDays === 1 ? '' : 's'} a partir da data da venda
              </Text>
              {config?.updatedAt && (
                <Text variant="bodySmall" style={styles.muted}>
                  Atualizado em {formatDateTimeBR(config.updatedAt)} por {config.updatedByName}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.muted}>Cashback ainda não foi configurado.</Text>
          )}
          <Button mode="outlined" onPress={startEditing} style={styles.editButton}>
            {configured ? 'Alterar configuração' : 'Configurar cashback'}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

export default function CashbackScreen() {
  return (
    <RequireRole role="ADMIN">
      <CashbackConfigScreen />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginBottom: 8 },
  muted: { opacity: 0.7, marginTop: 4 },
  summary: { marginTop: 16 },
  editButton: { marginTop: 16, alignSelf: 'flex-start' },
  form: { marginTop: 16 },
  input: { marginTop: 8 },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});
