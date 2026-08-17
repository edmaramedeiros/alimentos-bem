import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, RadioButton, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { createUser } from '@/api/users';
import { RequireRole } from '@/components/require-role';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
  role: z.enum(['ADMIN', 'VENDEDOR']),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function NewUserForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', role: 'VENDEDOR', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      router.back();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível criar o usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Novo usuário
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
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="E-mail"
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email?.message}
      </HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Senha provisória"
            mode="outlined"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.password}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>
        {errors.password?.message}
      </HelperText>

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="Telefone (opcional)" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
        )}
      />

      <Text variant="labelLarge" style={styles.roleLabel}>
        Papel
      </Text>
      <Controller
        control={control}
        name="role"
        render={({ field: { onChange, value } }) => (
          <RadioButton.Group onValueChange={onChange} value={value}>
            <View style={styles.roleRow}>
              <RadioButton.Item label="Vendedora" value="VENDEDOR" style={styles.roleItem} />
              <RadioButton.Item label="Administradora" value="ADMIN" style={styles.roleItem} />
            </View>
          </RadioButton.Group>
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

export default function NewUserScreen() {
  return (
    <RequireRole role="ADMIN">
      <NewUserForm />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { marginBottom: 16 },
  input: { marginTop: 8 },
  roleLabel: { marginTop: 16 },
  roleRow: { flexDirection: 'row' },
  roleItem: { flex: 1, paddingHorizontal: 0 },
  button: { marginTop: 16, marginBottom: 32 },
});
