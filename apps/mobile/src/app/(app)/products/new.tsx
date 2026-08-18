import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { createProduct } from '@/api/products';
import { CategoryPicker } from '@/components/category-picker';
import { RequireRole } from '@/components/require-role';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  sku: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().min(1, 'Informe a unidade'),
  price: z.string().min(1, 'Informe o preço'),
});

type FormData = z.infer<typeof schema>;

function NewProductForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', sku: '', category: '', description: '', unit: '', price: '' },
  });

  const onSubmit = async (data: FormData) => {
    const price = Number(data.price.replace(',', '.'));
    if (!price || price <= 0) {
      setServerError('Informe um preço válido');
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      await createProduct({
        name: data.name,
        sku: data.sku || undefined,
        category: data.category || undefined,
        description: data.description || undefined,
        unit: data.unit,
        price,
      });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível criar o produto.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Novo produto
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="Nome" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} error={!!errors.name} />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name?.message}
      </HelperText>

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => <CategoryPicker value={value ?? ''} onChange={onChange} />}
      />

      <Controller
        control={control}
        name="unit"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Unidade (ex: 500g)"
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.unit}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.unit}>
        {errors.unit?.message}
      </HelperText>

      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Preço"
            mode="outlined"
            keyboardType="decimal-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.price}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.price}>
        {errors.price?.message}
      </HelperText>

      <Controller
        control={control}
        name="sku"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="SKU (opcional)" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Descrição (opcional)"
            mode="outlined"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
          />
        )}
      />

      <HelperText type="error" visible={!!serverError}>
        {serverError}
      </HelperText>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting} style={styles.button}>
        Salvar
      </Button>
    </ScrollView>
  );
}

export default function NewProductScreen() {
  return (
    <RequireRole role="ADMIN">
      <NewProductForm />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 16 },
  input: { marginTop: 8 },
  button: { marginTop: 16 },
});
