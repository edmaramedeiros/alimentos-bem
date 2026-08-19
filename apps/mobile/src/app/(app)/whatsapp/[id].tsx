import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, List, Text } from 'react-native-paper';

import { getCampaign, listCampaignRecipients } from '@/api/whatsapp';
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
      {recipientsQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        recipientsQuery.data?.map((recipient) => (
          <List.Item
            key={recipient.id}
            title={recipient.customerName}
            description={recipient.errorMessage ?? recipient.phone}
            right={() => (
              <Chip compact style={statusChipStyle(recipient.status)}>
                {STATUS_LABEL[recipient.status] ?? recipient.status}
              </Chip>
            )}
          />
        ))
      )}
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
});
