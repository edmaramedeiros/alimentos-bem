import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { login } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const response = await login(data.email, data.password);
      setSession(response.token, response.user);
      router.replace('/');
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível conectar ao servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text variant="headlineMedium" style={styles.title}>
          Edmara Medeiros
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          alimentos do bem
        </Text>

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
              label="Senha"
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

        <HelperText type="error" visible={!!serverError}>
          {serverError}
        </HelperText>

        <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting} style={styles.button}>
          Entrar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 24, fontStyle: 'italic' },
  input: { marginTop: 8 },
  button: { marginTop: 16 },
});
