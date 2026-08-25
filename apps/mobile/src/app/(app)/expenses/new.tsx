import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, RadioButton, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import type { ExpenseCategory } from '@/api/types';
import { createExpense } from '@/api/expenses';
import { RequireRole } from '@/components/require-role';
import { dateMaskToISO, expenseCategoryLabel, formatDateMask, todayDateMask } from '@/utils/format';

const CATEGORIES: ExpenseCategory[] = ['MATERIA_PRIMA', 'SUPRIMENTOS', 'LOGISTICA', 'TAXAS'];

const schema = z.object({
  creditorName: z.string().min(1, 'Informe o nome do credor'),
  category: z.enum(['MATERIA_PRIMA', 'SUPRIMENTOS', 'LOGISTICA', 'TAXAS']),
  expenseDate: z.string().min(1, 'Informe a data'),
  payingCompanyName: z.string().min(1, 'Informe a empresa pagadora'),
});

type FormData = z.infer<typeof schema>;

function NewExpenseForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      creditorName: '',
      category: 'MATERIA_PRIMA',
      expenseDate: todayDateMask(),
      payingCompanyName: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const isoDate = dateMaskToISO(data.expenseDate);
    if (!isoDate) {
      setServerError('Informe uma data válida no formato DD/MM/AAAA');
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      await createExpense({
        creditorName: data.creditorName,
        category: data.category,
        expenseDate: isoDate,
        payingCompanyName: data.payingCompanyName,
      });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      router.back();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível registrar a despesa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Nova despesa
      </Text>

      <Controller
        control={control}
        name="creditorName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Credor"
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.creditorName}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.creditorName}>
        {errors.creditorName?.message}
      </HelperText>

      <Text variant="bodyMedium" style={styles.label}>
        Categoria
      </Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <RadioButton.Group onValueChange={(v) => onChange(v as ExpenseCategory)} value={value}>
            {CATEGORIES.map((category) => (
              <RadioButton.Item key={category} label={expenseCategoryLabel(category)} value={category} />
            ))}
          </RadioButton.Group>
        )}
      />

      <Controller
        control={control}
        name="expenseDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Data"
            mode="outlined"
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            onBlur={onBlur}
            onChangeText={(text) => onChange(formatDateMask(text))}
            value={value}
            style={styles.input}
            error={!!errors.expenseDate}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.expenseDate}>
        {errors.expenseDate?.message}
      </HelperText>

      <Controller
        control={control}
        name="payingCompanyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Empresa pagadora"
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.payingCompanyName}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.payingCompanyName}>
        {errors.payingCompanyName?.message}
      </HelperText>

      <HelperText type="error" visible={!!serverError}>
        {serverError}
      </HelperText>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting} style={styles.button}>
        Salvar
      </Button>
    </ScrollView>
  );
}

export default function NewExpenseScreen() {
  return (
    <RequireRole role="ADMIN">
      <NewExpenseForm />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 16 },
  input: { marginTop: 8 },
  label: { marginTop: 16 },
  button: { marginTop: 16, marginBottom: 32 },
});
