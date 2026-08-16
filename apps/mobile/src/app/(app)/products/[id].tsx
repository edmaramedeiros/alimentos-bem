import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, List, Portal, Text, TextInput } from 'react-native-paper';

import { deactivateProduct, getPriceHistory, getProduct, setProductPrice } from '@/api/products';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrencyBRL, formatDateTimeBR } from '@/utils/format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const queryClient = useQueryClient();

  const productQuery = useQuery({ queryKey: ['products', id], queryFn: () => getProduct(id) });
  const historyQuery = useQuery({ queryKey: ['products', id, 'price-history'], queryFn: () => getPriceHistory(id) });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  const submitNewPrice = async () => {
    const parsed = Number(newPrice.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      setPriceError('Informe um preço válido');
      return;
    }
    setSaving(true);
    setPriceError(null);
    try {
      await setProductPrice(id, parsed);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', id] }),
        queryClient.invalidateQueries({ queryKey: ['products', id, 'price-history'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      setDialogVisible(false);
      setNewPrice('');
    } catch {
      setPriceError('Não foi possível atualizar o preço.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    await deactivateProduct(id);
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    router.back();
  };

  if (productQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!productQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Produto não encontrado.</Text>
      </View>
    );
  }

  const product = productQuery.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall">{product.name}</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {product.unit}
        {product.sku ? ` · SKU ${product.sku}` : ''}
      </Text>
      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      <Card style={styles.priceCard}>
        <Card.Content>
          <Text variant="labelMedium">Preço atual</Text>
          <Text variant="headlineMedium">{formatCurrencyBRL(product.currentPrice)}</Text>
        </Card.Content>
        {isAdmin && (
          <Card.Actions>
            <Button onPress={() => setDialogVisible(true)}>Alterar preço</Button>
          </Card.Actions>
        )}
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Histórico de preços
      </Text>
      {historyQuery.data?.map((entry) => (
        <List.Item
          key={entry.id}
          title={formatCurrencyBRL(entry.price)}
          description={
            entry.effectiveTo
              ? `${formatDateTimeBR(entry.effectiveFrom)} até ${formatDateTimeBR(entry.effectiveTo)}`
              : `Desde ${formatDateTimeBR(entry.effectiveFrom)} · vigente`
          }
        />
      ))}

      {isAdmin && (
        <Button
          mode="outlined"
          textColor="#A74C39"
          style={styles.deactivateButton}
          onPress={handleDeactivate}
          disabled={!product.active}
        >
          {product.active ? 'Desativar produto' : 'Produto inativo'}
        </Button>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Alterar preço</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Novo preço"
              mode="outlined"
              keyboardType="decimal-pad"
              value={newPrice}
              onChangeText={setNewPrice}
              error={!!priceError}
            />
            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={submitNewPrice} loading={saving} disabled={saving}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { opacity: 0.7 },
  description: { marginTop: 8 },
  priceCard: { marginTop: 16 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  deactivateButton: { marginTop: 24 },
  errorText: { color: '#A74C39', marginTop: 4 },
});
