import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Dialog, List, Portal, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import type { WhatsappBroadcastRecipient } from '@/api/types';
import { getCampaign, listCampaignRecipients, resendCampaignRecipient } from '@/api/whatsapp';
import { formatDateTimeBR } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Na fila',
  SENT: 'Enviada',
  FAILED: 'Falhou',
};

function statusChipStyle(status: string) {
  if (status === 'SENT') return { backgroundColor: '#C6C664' };
  if (status === 'FAILED') return { backgroundColor: '#DC9251' };
  return { backgroundColor: '#F4EFEB' };
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Na fila',
  SENDING: 'Enviando',
  DONE: 'Concluída',
  FAILED: 'Falhou',
};

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedRecipient, setSelectedRecipient] = useState<WhatsappBroadcastRecipient | null>(null);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const campaignQuery = useQuery({
    queryKey: ['whatsapp', 'campaign', id],
    queryFn: () => getCampaign(id),
    refetchInterval: 8000,
  });
  const recipientsQuery = useQuery({
    queryKey: ['whatsapp', 'campaign', id, 'recipients'],
    queryFn: () => listCampaignRecipients(id),
    refetchInterval: 8000,
  });

  const closeDialog = () => {
    setSelectedRecipient(null);
    setResendError(null);
  };

  const handleResend = async () => {
    if (!selectedRecipient) return;
    setResending(true);
    setResendError(null);
    try {
      await resendCampaignRecipient(id, selectedRecipient.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaign', id] }),
        queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaign', id, 'recipients'] }),
      ]);
      closeDialog();
    } catch (error) {
      setResendError(error instanceof ApiError ? error.message : 'Não foi possível marcar para reenviar.');
    } finally {
      setResending(false);
    }
  };

  if (campaignQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const campaign = campaignQuery.data;
  if (!campaign) {
    return (
      <View style={styles.center}>
        <Text>Campanha não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">{campaign.message}</Text>
          {campaign.hasAttachment && <Text style={styles.muted}>Anexo: {campaign.attachmentFileName}</Text>}
          <Text style={styles.muted}>{formatDateTimeBR(campaign.createdAt)}</Text>
          <View style={styles.statsRow}>
            <Chip compact style={{ backgroundColor: '#F4EFEB' }}>
              {CAMPAIGN_STATUS_LABEL[campaign.status] ?? campaign.status}
            </Chip>
            <Text style={styles.stats}>
              {campaign.sentCount} enviadas · {campaign.failedCount} falharam · {campaign.recipientCount} no total
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Destinatários
      </Text>
      <Text variant="bodySmall" style={styles.muted}>
        Toque num destinatário já enviado ou que falhou para marcar o envio de novo.
      </Text>
      {recipientsQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        recipientsQuery.data?.map((recipient) => (
          <List.Item
            key={recipient.id}
            title={recipient.customerName}
            description={recipient.errorMessage ?? recipient.phone}
            onPress={recipient.status === 'QUEUED' ? undefined : () => setSelectedRecipient(recipient)}
            right={() => (
              <Chip compact style={statusChipStyle(recipient.status)}>
                {STATUS_LABEL[recipient.status] ?? recipient.status}
              </Chip>
            )}
          />
        ))
      )}

      <Portal>
        <Dialog visible={!!selectedRecipient} onDismiss={closeDialog}>
          <Dialog.Title>Reenviar mensagem?</Dialog.Title>
          <Dialog.Content>
            <Text>
              A mensagem para {selectedRecipient?.customerName} será marcada para ser enviada de novo na próxima janela
              de envio.
            </Text>
            {resendError ? <Text style={styles.errorText}>{resendError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog} disabled={resending}>
              Cancelar
            </Button>
            <Button onPress={handleResend} loading={resending} disabled={resending}>
              Marcar para reenviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { marginBottom: 16 },
  muted: { opacity: 0.7, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  stats: { opacity: 0.8 },
  sectionTitle: { marginBottom: 4 },
  errorText: { color: '#A74C39', marginTop: 8 },
});
