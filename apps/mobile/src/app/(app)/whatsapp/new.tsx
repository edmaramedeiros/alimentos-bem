import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { createCampaign, previewRecipients } from '@/api/whatsapp';
import { readAssetAsBase64 } from '@/utils/read-file-base64';

export default function NewCampaignScreen() {
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [delaySeconds, setDelaySeconds] = useState('5');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [debouncedCity, setDebouncedCity] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(cityFilter);
      setDebouncedName(nameFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [cityFilter, nameFilter]);

  const previewQuery = useQuery({
    queryKey: ['whatsapp', 'preview', debouncedCity, debouncedName],
    queryFn: () => previewRecipients(debouncedCity, debouncedName),
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const delayValue = parseInt(delaySeconds.replace(/\D/g, ''), 10);
  const messageValid = message.trim().length > 0;
  const delayValid = !Number.isNaN(delayValue) && delayValue >= 3 && delayValue <= 300;
  const canSubmit = messageValid && delayValid && !submitting;

  const pickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
    if (result.canceled || !result.assets?.length) return;
    setAttachment(result.assets[0]);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setServerError(null);
    try {
      let attachmentBase64: string | undefined;
      if (attachment) {
        attachmentBase64 = await readAssetAsBase64(attachment);
      }
      const campaign = await createCampaign({
        message: message.trim(),
        attachmentBase64,
        attachmentFileName: attachment?.name,
        attachmentMimeType: attachment?.mimeType,
        cityFilter: cityFilter.trim() || undefined,
        nameFilter: nameFilter.trim() || undefined,
        delaySeconds: delayValue,
      });
      await queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaigns'] });
      router.replace(`/whatsapp/${campaign.id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível criar a campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  const recipientCount = previewQuery.data?.length ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Nova campanha
      </Text>

      <TextInput
        label="Mensagem"
        mode="outlined"
        multiline
        numberOfLines={5}
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <Button
        mode="text"
        compact
        icon="account-plus"
        onPress={() => setMessage((current) => (current && !current.endsWith(' ') ? `${current} {{nome}}` : `${current}{{nome}}`))}
        style={styles.insertNameButton}
      >
        Inserir nome do cliente
      </Button>
      <HelperText type="info" visible>
        Use {'{{nome}}'} na mensagem para que cada cliente receba com o próprio primeiro nome, como em uma mala direta.
      </HelperText>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Anexo (opcional)
      </Text>
      {attachment ? (
        <View style={styles.attachmentRow}>
          <Text style={styles.attachmentName} numberOfLines={1}>
            {attachment.name}
          </Text>
          <IconButton icon="close" size={18} onPress={() => setAttachment(null)} accessibilityLabel="Remover anexo" />
        </View>
      ) : (
        <Button mode="outlined" onPress={pickAttachment} icon="paperclip" style={styles.pickButton}>
          Escolher imagem ou PDF
        </Button>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Quem vai receber
      </Text>
      <Text style={styles.muted}>Só clientes que aceitaram receber mensagens no WhatsApp.</Text>

      <TextInput label="Município (opcional)" mode="outlined" value={cityFilter} onChangeText={setCityFilter} style={styles.input} />
      <TextInput
        label="Nome do cliente (opcional)"
        mode="outlined"
        value={nameFilter}
        onChangeText={setNameFilter}
        style={styles.input}
      />

      <View style={styles.previewBox}>
        <Text style={previewQuery.isLoading ? styles.muted : styles.previewCount}>
          {previewQuery.isLoading
            ? 'Calculando...'
            : recipientCount === 1
              ? '1 cliente vai receber'
              : `${recipientCount} clientes vão receber`}
        </Text>
      </View>

      <TextInput
        label="Tempo de espera entre mensagens (segundos)"
        mode="outlined"
        keyboardType="number-pad"
        value={delaySeconds}
        onChangeText={setDelaySeconds}
        style={styles.input}
        error={!delayValid}
      />
      <HelperText type={delayValid ? 'info' : 'error'} visible>
        {delayValid ? 'Mínimo 3s, máximo 300s. Um intervalo maior reduz o risco do número ser bloqueado.' : 'Informe um valor entre 3 e 300 segundos.'}
      </HelperText>

      <HelperText type="error" visible={!!serverError}>
        {serverError}
      </HelperText>

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={submitting}
        disabled={!canSubmit || recipientCount === 0}
        style={styles.submitButton}
      >
        Enviar campanha
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: { marginBottom: 16 },
  input: { marginTop: 8 },
  insertNameButton: { alignSelf: 'flex-start', marginTop: 2 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  pickButton: { alignSelf: 'flex-start', marginTop: 8 },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ECCFB1',
    borderRadius: 8,
  },
  attachmentName: { flex: 1 },
  muted: { opacity: 0.7, marginTop: 4 },
  previewBox: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#F4EFEB' },
  previewCount: { fontWeight: '600' },
  submitButton: { marginTop: 16, marginBottom: 32 },
});
