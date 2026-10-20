import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Dialog, List, Portal, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import type { WhatsappBroadcastRecipient } from '@/api/types';
import {
  getCampaign,
  listCampaignRecipients,
  pauseCampaign,
  removeCampaignRecipient,
  resendCampaignRecipient,
  resumeCampaign,
} from '@/api/whatsapp';
import { formatDateTimeBR } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Na fila',
  SENT: 'Enviada',
  FAILED: 'Falhou',
  CANCELLED: 'Removido',
};

function statusChipStyle(status: string) {
  if (status === 'SENT') return { backgroundColor: '#C6C664' };
  if (status === 'FAILED') return { backgroundColor: '#DC9251' };
  if (status === 'CANCELLED') return { backgroundColor: '#E0E0E0' };
  return { backgroundColor: '#F4EFEB' };
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Na fila',
  SENDING: 'Enviando',
  PAUSED: 'Pausada',
  DONE: 'Concluída',
  FAILED: 'Falhou',
};

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedRecipient, setSelectedRecipient] = useState<WhatsappBroadcastRecipient | null>(null);
  const [actionLoading, setActionLoading] = useState<'resend' | 'remove' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [campaignActionLoading, setCampaignActionLoading] = useState(false);
  const [campaignActionError, setCampaignActionError] = useState<string | null>(null);

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
    setActionError(null);
  };

  const refreshCampaign = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaign', id] }),
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaign', id, 'recipients'] }),
    ]);

  const handleResend = async () => {
    if (!selectedRecipient) return;
    setActionLoading('resend');
    setActionError(null);
    try {
      await resendCampaignRecipient(id, selectedRecipient.id);
      await refreshCampaign();
      closeDialog();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Não foi possível marcar para reenviar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async () => {
    if (!selectedRecipient) return;
    setActionLoading('remove');
    setActionError(null);
    try {
      await removeCampaignRecipient(id, selectedRecipient.id);
      await refreshCampaign();
      closeDialog();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Não foi possível remover da fila.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async () => {
    setCampaignActionLoading(true);
    setCampaignActionError(null);
    try {
      await pauseCampaign(id);
      await refreshCampaign();
    } catch (error) {
      setCampaignActionError(error instanceof ApiError ? error.message : 'Não foi possível pausar a campanha.');
    } finally {
      setCampaignActionLoading(false);
    }
  };

  const handleResume = async () => {
    setCampaignActionLoading(true);
    setCampaignActionError(null);
    try {
      await resumeCampaign(id);
      await refreshCampaign();
    } catch (error) {
      setCampaignActionError(error instanceof ApiError ? error.message : 'Não foi possível retomar a campanha.');
    } finally {
      setCampaignActionLoading(false);
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

  const canResend = selectedRecipient?.status === 'SENT' || selectedRecipient?.status === 'FAILED';
  const canRemove = selectedRecipient?.status === 'QUEUED' || selectedRecipient?.status === 'FAILED';

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

          {(campaign.status === 'QUEUED' || campaign.status === 'SENDING') && (
            <Button
              mode="outlined"
              onPress={handlePause}
              loading={campaignActionLoading}
              disabled={campaignActionLoading}
              style={styles.campaignActionButton}
            >
              Pausar campanha
            </Button>
          )}
          {campaign.status === 'PAUSED' && (
            <Button
              mode="contained"
              onPress={handleResume}
              loading={campaignActionLoading}
              disabled={campaignActionLoading}
              style={styles.campaignActionButton}
            >
              Retomar envio
            </Button>
          )}
          {campaignActionError ? <Text style={styles.errorText}>{campaignActionError}</Text> : null}
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Destinatários
      </Text>
      <Text variant="bodySmall" style={styles.muted}>
        Toque num destinatário para reenviar a mensagem ou removê-lo da fila.
      </Text>
      {recipientsQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        recipientsQuery.data?.map((recipient) => (
          <List.Item
            key={recipient.id}
            title={recipient.customerName}
            description={recipient.errorMessage ?? recipient.phone}
            onPress={recipient.status === 'CANCELLED' ? undefined : () => setSelectedRecipient(recipient)}
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
          <Dialog.Title>{selectedRecipient?.customerName}</Dialog.Title>
          <Dialog.Content>
            <Text>O que você quer fazer com este destinatário?</Text>
            {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog} disabled={!!actionLoading}>
              Fechar
            </Button>
            {canRemove && (
              <Button
                onPress={handleRemove}
                loading={actionLoading === 'remove'}
                disabled={!!actionLoading}
                textColor="#A74C39"
              >
                Remover da fila
              </Button>
            )}
            {canResend && (
              <Button onPress={handleResend} loading={actionLoading === 'resend'} disabled={!!actionLoading}>
                Reenviar
              </Button>
            )}
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
  campaignActionButton: { marginTop: 12, alignSelf: 'flex-start' },
  sectionTitle: { marginBottom: 4 },
  errorText: { color: '#A74C39', marginTop: 8 },
});
