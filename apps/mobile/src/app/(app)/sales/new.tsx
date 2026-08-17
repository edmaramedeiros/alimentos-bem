import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Divider, HelperText, IconButton, List, Portal, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { listCustomers } from '@/api/customers';
import { listProducts } from '@/api/products';
import { createSale } from '@/api/sales';
import type { Customer, Product } from '@/api/types';
import { formatCurrencyBRL } from '@/utils/format';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function NewSaleScreen() {
  const queryClient = useQueryClient();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [pickingProduct, setPickingProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('1');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const customersQuery = useQuery({ queryKey: ['customers'], queryFn: () => listCustomers() });
  const productsQuery = useQuery({ queryKey: ['products', true], queryFn: () => listProducts(true) });

  const total = cart.reduce((sum, item) => sum + item.product.currentPrice * item.quantity, 0);

  const openProductPicker = () => {
    setPickingProduct(null);
    setQuantityInput('1');
    setProductPickerVisible(true);
  };

  const confirmAddProduct = () => {
    if (!pickingProduct) return;
    const quantity = Number(quantityInput.replace(',', '.'));
    if (!quantity || quantity <= 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.product.id === pickingProduct.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === pickingProduct.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { product: pickingProduct, quantity }];
    });
    setProductPickerVisible(false);
  };

  const removeItem = (productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const canSubmit = !!customer && cart.length > 0 && !submitting;

  const onSubmit = async () => {
    if (!customer || cart.length === 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const sale = await createSale({
        customerId: customer.id,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
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
          description={customer.phone ?? undefined}
          left={(props) => <List.Icon {...props} icon="account" />}
          onPress={() => setCustomerPickerVisible(true)}
        />
      ) : (
        <Button mode="outlined" onPress={() => setCustomerPickerVisible(true)} style={styles.pickButton}>
          Selecionar cliente
        </Button>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Produtos
      </Text>
      {cart.map((item) => (
        <List.Item
          key={item.product.id}
          title={item.product.name}
          description={`${item.quantity} ${item.product.unit} × ${formatCurrencyBRL(item.product.currentPrice)}`}
          right={() => (
            <View style={styles.itemRight}>
              <Text style={styles.subtotal}>{formatCurrencyBRL(item.product.currentPrice * item.quantity)}</Text>
              <IconButton icon="close" size={20} onPress={() => removeItem(item.product.id)} />
            </View>
          )}
        />
      ))}
      <Button mode="outlined" onPress={openProductPicker} style={styles.pickButton}>
        Adicionar produto
      </Button>

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

      {/* Customer picker */}
      <Portal>
        <Dialog visible={customerPickerVisible} onDismiss={() => setCustomerPickerVisible(false)} style={styles.dialog}>
          <Dialog.Title>Selecionar cliente</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              {customersQuery.data?.length ? (
                customersQuery.data.map((c) => (
                  <List.Item
                    key={c.id}
                    title={c.name}
                    description={c.phone ?? undefined}
                    onPress={() => {
                      setCustomer(c);
                      setCustomerPickerVisible(false);
                    }}
                  />
                ))
              ) : (
                <Text style={styles.emptyDialog}>Nenhum cliente cadastrado ainda.</Text>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCustomerPickerVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Product picker */}
      <Portal>
        <Dialog visible={productPickerVisible} onDismiss={() => setProductPickerVisible(false)} style={styles.dialog}>
          <Dialog.Title>{pickingProduct ? pickingProduct.name : 'Selecionar produto'}</Dialog.Title>
          {pickingProduct ? (
            <Dialog.Content>
              <Text style={styles.muted}>{formatCurrencyBRL(pickingProduct.currentPrice)} / {pickingProduct.unit}</Text>
              <TextInput
                label="Quantidade"
                mode="outlined"
                keyboardType="decimal-pad"
                value={quantityInput}
                onChangeText={setQuantityInput}
                style={styles.quantityInput}
              />
            </Dialog.Content>
          ) : (
            <Dialog.ScrollArea style={styles.dialogScroll}>
              <ScrollView>
                {productsQuery.data?.map((p) => (
                  <List.Item
                    key={p.id}
                    title={p.name}
                    description={`${formatCurrencyBRL(p.currentPrice)} / ${p.unit}`}
                    onPress={() => {
                      setPickingProduct(p);
                      setQuantityInput('1');
                    }}
                  />
                ))}
              </ScrollView>
            </Dialog.ScrollArea>
          )}
          <Dialog.Actions>
            {pickingProduct && <Button onPress={() => setPickingProduct(null)}>Voltar</Button>}
            {pickingProduct && <Button onPress={confirmAddProduct}>Adicionar</Button>}
            {!pickingProduct && <Button onPress={() => setProductPickerVisible(false)}>Fechar</Button>}
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Divider />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 8 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  pickButton: { marginTop: 8 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subtotal: { fontWeight: '600', alignSelf: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ECCFB1' },
  submitButton: { marginTop: 16, marginBottom: 32 },
  dialog: { maxHeight: '80%' },
  dialogScroll: { maxHeight: 400 },
  emptyDialog: { padding: 16, opacity: 0.6 },
  muted: { opacity: 0.7, marginBottom: 8 },
  quantityInput: { marginTop: 8 },
});
