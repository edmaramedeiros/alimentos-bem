import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Switch, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { CityPicker } from '@/components/city-picker';
import { StatePicker } from '@/components/state-picker';
import { formatPhoneMask } from '@/utils/format';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('E-mail inválido')]).optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
  whatsappOptIn: z.boolean(),
});

export type CustomerFormData = z.infer<typeof schema>;

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitting,
  serverError,
  submitLabel = 'Salvar',
}: {
  defaultValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  submitting: boolean;
  serverError: string | null;
  submitLabel?: string;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      addressLine: '',
      city: '',
      state: '',
      zip: '',
      notes: '',
      whatsappOptIn: false,
      ...defaultValues,
    },
  });

  return (
    <View>
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
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Telefone / WhatsApp"
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="(66) 99999-9999"
            maxLength={15}
            onBlur={onBlur}
            onChangeText={(text) => onChange(formatPhoneMask(text))}
            value={value}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="E-mail (opcional)"
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
        name="addressLine"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="Endereço" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
        )}
      />

      <View style={styles.row}>
        <View style={styles.stateInput}>
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, value } }) => (
              <StatePicker
                value={value ?? ''}
                onChange={(uf) => {
                  onChange(uf);
                  if (watch('state') !== uf) {
                    setValue('city', '');
                  }
                }}
              />
            )}
          />
        </View>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <CityPicker value={value ?? ''} onChange={onChange} uf={watch('state') ?? ''} />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="zip"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="CEP" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Observações"
            mode="outlined"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="whatsappOptIn"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text>Aceita receber mensagens promocionais no WhatsApp</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <HelperText type="error" visible={!!serverError}>
        {serverError}
      </HelperText>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting} style={styles.button}>
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: 8 },
  row: { flexDirection: 'row', gap: 8 },
  rowItem: { flex: 3 },
  stateInput: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  button: { marginTop: 16, marginBottom: 32 },
});
