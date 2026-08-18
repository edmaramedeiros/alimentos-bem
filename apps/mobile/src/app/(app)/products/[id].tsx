import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Dialog, List, Portal, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { deactivateProduct, getPriceHistory, getProduct, setProductPrice, updateProduct } from '@/api/products';
import { CategoryPicker } from '@/components/category-picker';
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

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const openEdit = () => {
    if (!productQuery.data) return;
    setEditName(productQuery.data.name);
    setEditCategory(productQuery.data.category ?? '');
    setEditUnit(productQuery.data.unit);
    setEditDescription(productQuery.data.description ?? '');
    setEditSku(productQuery.data.sku ?? '');
    setEditError(null);
    setEditVisible(true);
  };

  const submitEdit = async () => {
    if (!productQuery.data) return;
    if (!editName.trim() || !editUnit.trim()) {
      setEditError('Nome e unidade são obrigatórios');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updateProduct(id, {
        name: editName,
        category: editCategory || undefined,
        unit: editUnit,
        description: editDescription || undefined,
        sku: editSku || undefined,
        active: productQuery.data.active,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', id] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'categories'] }),
      ]);
      setEditVisible(false);
    } catch (error) {
      setEditError(error instanceof ApiError ? error.message : 'Não foi possível salvar as alterações.');
    } finally {
      setEditSaving(false);
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
      {product.category ? <Chip style={styles.categoryChip}>{product.category}</Chip> : null}
      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      {isAdmin && (
        <Button mode="text" onPress={openEdit} style={styles.editButton}>
          Editar informações
        </Button>
      )}

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

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)} style={styles.editDialog}>
          <Dialog.Title>Editar produto</Dialog.Title>
          <Dialog.ScrollArea style={styles.editDialogScroll}>
            <ScrollView>
              <TextInput label="Nome" mode="outlined" value={editName} onChangeText={setEditName} style={styles.editInput} />
              <CategoryPicker value={editCategory} onChange={setEditCategory} />
              <TextInput label="Unidade" mode="outlined" value={editUnit} onChangeText={setEditUnit} style={styles.editInput} />
              <TextInput label="SKU (opcional)" mode="outlined" value={editSku} onChangeText={setEditSku} style={styles.editInput} />
              <TextInput
                label="Descrição (opcional)"
                mode="outlined"
                multiline
                value={editDescription}
                onChangeText={setEditDescription}
                style={styles.editInput}
              />
              {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)} disabled={editSaving}>
              Cancelar
            </Button>
            <Button onPress={submitEdit} loading={editSaving} disabled={editSaving}>
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
  categoryChip: { alignSelf: 'flex-start', marginTop: 8 },
  description: { marginTop: 8 },
  editButton: { alignSelf: 'flex-start' },
  priceCard: { marginTop: 8 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  deactivateButton: { marginTop: 24 },
  errorText: { color: '#A74C39', marginTop: 4 },
  editDialog: { maxHeight: '85%' },
  editDialogScroll: { maxHeight: 420 },
  editInput: { marginTop: 8 },
});
