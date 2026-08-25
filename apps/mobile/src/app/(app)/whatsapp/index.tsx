import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Dialog, HelperText, List, Portal, Text } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { disconnectSession, getSessionQr, getSessionStatus, listCampaigns } from '@/api/whatsapp';
import { useAuthStore } from '@/store/auth-store';
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
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
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

  const [disconnectDialogVisible, setDisconnectDialogVisible] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setDisconnectError(null);
    try {
      await disconnectSession();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['whatsapp', 'status'] }),
        queryClient.invalidateQueries({ queryKey: ['whatsapp', 'qr'] }),
      ]);
      setDisconnectDialogVisible(false);
    } catch (error) {
      setDisconnectError(error instanceof ApiError ? error.message : 'Não foi possível desconectar o WhatsApp.');
    } finally {
      setDisconnecting(false);
    }
  };

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
            <View>
              <View style={styles.connectedRow}>
                <List.Icon icon="check-circle" color="#70754D" />
                <View>
                  <Text variant="titleMedium">Conectado</Text>
                  <Text style={styles.muted}>Número: {statusQuery.data?.phoneNumber}</Text>
                </View>
              </View>
              <Button
                mode="text"
                textColor="#A74C39"
                onPress={() => {
                  setDisconnectError(null);
                  setDisconnectDialogVisible(true);
                }}
                style={styles.disconnectButton}
              >
                Desconectar
              </Button>
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
            description={`${formatDateTimeBR(campaign.createdAt)} · ${campaign.sentCount}/${campaign.recipientCount} enviadas${
              isAdmin ? ` · ${campaign.createdByName}` : ''
            }`}
            onPress={() => router.push(`/whatsapp/${campaign.id}`)}
            right={() => (
              <Chip compact style={statusChipStyle(campaign.status)}>
                {STATUS_LABEL[campaign.status] ?? campaign.status}
              </Chip>
            )}
          />
        ))
      )}

      <Portal>
        <Dialog visible={disconnectDialogVisible} onDismiss={() => setDisconnectDialogVisible(false)}>
          <Dialog.Title>Desconectar WhatsApp?</Dialog.Title>
          <Dialog.Content>
            <Text>
              O número conectado vai parar de enviar campanhas. Para reconectar (o mesmo número ou outro), será
              preciso escanear um novo QR code.
            </Text>
            {disconnectError ? <HelperText type="error">{disconnectError}</HelperText> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDisconnectDialogVisible(false)} disabled={disconnecting}>
              Cancelar
            </Button>
            <Button onPress={handleDisconnect} loading={disconnecting} disabled={disconnecting} textColor="#A74C39">
              Desconectar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: { marginBottom: 16 },
  card: { marginBottom: 16 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disconnectButton: { alignSelf: 'flex-start', marginTop: 4 },
  qrSection: { alignItems: 'center', gap: 8 },
  qrTitle: { textAlign: 'center' },
  qrImage: { width: 220, height: 220, marginTop: 8 },
  qrLoading: { marginVertical: 32 },
  newButton: { marginBottom: 4, alignSelf: 'flex-start' },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  muted: { opacity: 0.7 },
});
