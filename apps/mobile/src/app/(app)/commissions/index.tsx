import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';

import { allCommissions, myCommissions } from '@/api/commissions';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrencyBRL, formatDateTimeBR, formatPercent } from '@/utils/format';

export default function CommissionsScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');

  const query = useQuery({
    queryKey: ['commissions', isAdmin ? 'all' : 'me'],
    queryFn: () => (isAdmin ? allCommissions() : myCommissions()),
  });

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (query.error || !query.data) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar as comissões.</Text>
      </View>
    );
  }

  const report = query.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="labelMedium">Total ganho</Text>
          <Text variant="headlineMedium">{formatCurrencyBRL(report.totalEarned)}</Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Vendas pagas
      </Text>
      {report.entries.length === 0 ? (
        <Text style={styles.empty}>Nenhuma comissão ganha ainda.</Text>
      ) : (
        report.entries.map((entry) => (
          <List.Item
            key={entry.saleId}
            title={`${entry.customerName}${isAdmin ? ` · ${entry.vendedorName}` : ''}`}
            description={`${formatDateTimeBR(entry.saleDate)} · ${formatCurrencyBRL(entry.totalAmount)} · ${formatPercent(entry.commissionRateApplied)}`}
            right={() => <Text style={styles.amount}>{formatCurrencyBRL(entry.commissionAmount)}</Text>}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  totalCard: { marginBottom: 8 },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  amount: { alignSelf: 'center', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 16, opacity: 0.6 },
});
