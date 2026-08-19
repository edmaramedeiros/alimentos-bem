import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, IconButton, List, Portal, Searchbar, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { listCustomers } from '@/api/customers';
import { listProducts } from '@/api/products';
import { createSale } from '@/api/sales';
import type { Customer } from '@/api/types';
import { formatCurrencyBRL } from '@/utils/format';
import { groupByCategory } from '@/utils/group-by-category';

function parseQuantity(text: string): number {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  if (!digitsOnly) return 0;
  return Math.max(0, parseInt(digitsOnly, 10));
}

export default function NewSaleScreen() {
  const queryClient = useQueryClient();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const customersQuery = useQuery({ queryKey: ['customers'], queryFn: () => listCustomers() });
  const filteredCustomers = useMemo(() => {
    const customers = customersQuery.data ?? [];
    const normalized = customerSearch.trim().toLowerCase();
    if (!normalized) return customers;
    const normalizedDigits = normalized.replace(/\D/g, '');
    return customers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(normalized);
      const phoneDigits = (c.phone ?? '').replace(/\D/g, '');
      const phoneMatch = normalizedDigits.length > 0 && phoneDigits.includes(normalizedDigits);
      return nameMatch || phoneMatch;
    });
  }, [customersQuery.data, customerSearch]);

  const openCustomerPicker = () => {
    setCustomerSearch('');
    setCustomerPickerVisible(true);
  };
  const productsQuery = useQuery({ queryKey: ['products', true], queryFn: () => listProducts(true) });
  const products = productsQuery.data ?? [];
  const productSections = useMemo(() => groupByCategory(products), [products]);

  const setQuantity = (productId: string, value: number) => {
    setQuantities((current) => ({ ...current, [productId]: Math.max(0, Math.floor(value)) }));
  };

  const selectedItems = useMemo(
    () => products.filter((product) => (quantities[product.id] ?? 0) > 0),
    [products, quantities]
  );

  const total = useMemo(
    () => selectedItems.reduce((sum, product) => sum + product.currentPrice * (quantities[product.id] ?? 0), 0),
    [selectedItems, quantities]
  );

  const canSubmit = !!customer && selectedItems.length > 0 && !submitting;

  const onSubmit = async () => {
    if (!customer || selectedItems.length === 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const sale = await createSale({
        customerId: customer.id,
        items: selectedItems.map((product) => ({ productId: product.id, quantity: quantities[product.id] })),
      });
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      router.replace(`/sales/${sale.id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível lançar a venda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Nova venda
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Cliente
      </Text>
      {customer ? (
        <List.Item
          title={customer.name}
          description={[customer.phone, customer.city].filter(Boolean).join(' · ') || undefined}
          left={(props) => <List.Icon {...props} icon="account" />}
          onPress={openCustomerPicker}
        />
      ) : (
        <Button mode="outlined" onPress={openCustomerPicker} style={styles.pickButton}>
          Selecionar cliente
        </Button>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Produtos
      </Text>
      {productsQuery.isLoading ? (
        <Text style={styles.muted}>Carregando produtos...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.muted}>Nenhum produto ativo cadastrado.</Text>
      ) : (
        productSections.map((section) => (
          <View key={section.title}>
            <Text variant="labelLarge" style={styles.categoryHeader}>
              {section.title}
            </Text>
            {section.data.map((product) => {
              const qty = quantities[product.id] ?? 0;
              return (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text>{product.name}</Text>
                    <Text style={styles.muted}>
                      {formatCurrencyBRL(product.currentPrice)} / {product.unit}
                    </Text>
                  </View>

                  <View style={styles.stepper}>
                    <IconButton
                      icon="minus"
                      size={18}
                      mode="outlined"
                      onPress={() => setQuantity(product.id, qty - 1)}
                      disabled={qty <= 0}
                      accessibilityLabel={`Diminuir quantidade de ${product.name}`}
                    />
                    <TextInput
                      mode="outlined"
                      dense
                      keyboardType="number-pad"
                      value={String(qty)}
                      onChangeText={(text) => setQuantity(product.id, parseQuantity(text))}
                      style={styles.qtyInput}
                      contentStyle={styles.qtyInputContent}
                    />
                    <IconButton
                      icon="plus"
                      size={18}
                      mode="outlined"
                      onPress={() => setQuantity(product.id, qty + 1)}
                      accessibilityLabel={`Aumentar quantidade de ${product.name}`}
                    />
                  </View>

                  <Text style={styles.subtotal}>{qty > 0 ? formatCurrencyBRL(product.currentPrice * qty) : '—'}</Text>
                </View>
              );
            })}
          </View>
        ))
      )}

      <View style={styles.totalRow}>
        <Text variant="titleMedium">Total</Text>
        <Text variant="titleMedium">{formatCurrencyBRL(total)}</Text>
      </View>

      <HelperText type="error" visible={!!serverError}>
        {serverError}
      </HelperText>

      <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={!canSubmit} style={styles.submitButton}>
        Finalizar venda
      </Button>

      <Portal>
        <Dialog visible={customerPickerVisible} onDismiss={() => setCustomerPickerVisible(false)} style={styles.dialog}>
          <Dialog.Title>Selecionar cliente</Dialog.Title>
          <View style={styles.searchWrapper}>
            <Searchbar placeholder="Buscar por nome ou telefone" value={customerSearch} onChangeText={setCustomerSearch} />
          </View>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            {customersQuery.data?.length ? (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(c) => c.id}
                renderItem={({ item: c }) => (
                  <List.Item
                    title={c.name}
                    description={[c.phone, c.city].filter(Boolean).join(' · ') || undefined}
                    onPress={() => {
                      setCustomer(c);
                      setCustomerPickerVisible(false);
                    }}
                  />
                )}
                ListEmptyComponent={<Text style={styles.emptyDialog}>Nenhum cliente encontrado.</Text>}
              />
            ) : (
              <Text style={styles.emptyDialog}>Nenhum cliente cadastrado ainda.</Text>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCustomerPickerVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 8 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  pickButton: { marginTop: 8 },
  categoryHeader: { marginTop: 16, opacity: 0.7 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECCFB1',
    gap: 8,
  },
  productInfo: { flex: 1, minWidth: 120 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  qtyInput: { width: 56, height: 40, textAlign: 'center' },
  qtyInputContent: { textAlign: 'center' },
  subtotal: { fontWeight: '600', minWidth: 90, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ECCFB1' },
  submitButton: { marginTop: 16, marginBottom: 32 },
  dialog: { maxHeight: '80%' },
  searchWrapper: { paddingHorizontal: 24, paddingBottom: 8 },
  dialogScroll: { maxHeight: 400 },
  emptyDialog: { padding: 16, opacity: 0.6 },
  muted: { opacity: 0.7 },
});
