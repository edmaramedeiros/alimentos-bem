import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, List, Text } from 'react-native-paper';

import { getSessionQr, getSessionStatus, listCampaigns } from '@/api/whatsapp';
import { formatDateTimeBR } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Na fila',
  SENDING: 'Enviando',
  DONE: 'Concluída',
  FAILED: 'Falhou',
};

function statusChipStyle(status: string) {
  if (status === 'DONE') return { backgroundColor: '#C6C664' };
  if (status === 'FAILED') return { backgroundColor: '#DC9251' };
  if (status === 'SENDING') return { backgroundColor: '#ECCFB1' };
  return { backgroundColor: '#F4EFEB' };
}

export default function WhatsappScreen() {
  const statusQuery = useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: getSessionStatus,
    refetchInterval: 5000,
  });
  const connected = statusQuery.data?.connected ?? false;

  const qrQuery = useQuery({
    queryKey: ['whatsapp', 'qr'],
    queryFn: getSessionQr,
    refetchInterval: 5000,
    enabled: !connected,
  });

  const campaignsQuery = useQuery({ queryKey: ['whatsapp', 'campaigns'], queryFn: listCampaigns });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        WhatsApp
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          {statusQuery.isLoading ? (
            <ActivityIndicator />
          ) : connected ? (
            <View style={styles.connectedRow}>
              <List.Icon icon="check-circle" color="#70754D" />
              <View>
                <Text variant="titleMedium">Conectado</Text>
                <Text style={styles.muted}>Número: {statusQuery.data?.phoneNumber}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.qrSection}>
              <Text variant="titleMedium" style={styles.qrTitle}>
                Escaneie para conectar
              </Text>
              <Text style={styles.muted}>
                Abra o WhatsApp no celular que vai enviar as campanhas → Configurações → Aparelhos conectados →
                Conectar um aparelho, e escaneie o código abaixo.
              </Text>
              {qrQuery.data?.qr ? (
                <Image source={{ uri: qrQuery.data.qr }} style={styles.qrImage} resizeMode="contain" />
              ) : (
                <ActivityIndicator style={styles.qrLoading} />
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={() => router.push('/whatsapp/new')} style={styles.newButton} disabled={!connected}>
        Nova campanha
      </Button>
      {!connected && <Text style={styles.muted}>Conecte o WhatsApp acima para poder criar campanhas.</Text>}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Campanhas
      </Text>
      {campaignsQuery.isLoading ? (
        <ActivityIndicator />
      ) : !campaignsQuery.data?.length ? (
        <Text style={styles.muted}>Nenhuma campanha criada ainda.</Text>
      ) : (
        campaignsQuery.data.map((campaign) => (
          <List.Item
            key={campaign.id}
            title={campaign.message}
            titleNumberOfLines={2}
            description={`${formatDateTimeBR(campaign.createdAt)} · ${campaign.sentCount}/${campaign.recipientCount} enviadas`}
            onPress={() => router.push(`/whatsapp/${campaign.id}`)}
            right={() => (
              <Chip compact style={statusChipStyle(campaign.status)}>
                {STATUS_LABEL[campaign.status] ?? campaign.status}
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
  title: { marginBottom: 16 },
  card: { marginBottom: 16 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrSection: { alignItems: 'center', gap: 8 },
  qrTitle: { textAlign: 'center' },
  qrImage: { width: 220, height: 220, marginTop: 8 },
  qrLoading: { marginVertical: 32 },
  newButton: { marginBottom: 4, alignSelf: 'flex-start' },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  muted: { opacity: 0.7 },
});
