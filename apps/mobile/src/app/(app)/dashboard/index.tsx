import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';

import { getDashboardIndicators } from '@/api/dashboard';
import { BarListChart } from '@/components/bar-list-chart';
import { RequireRole } from '@/components/require-role';
import { formatCurrencyBRL, formatMonthLabel, formatPercent } from '@/utils/format';

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

function DashboardContent() {
  const [month, setMonth] = useState(currentYearMonth);
  const isCurrentMonth = month === currentYearMonth();

  const indicatorsQuery = useQuery({
    queryKey: ['dashboard', 'indicators', month],
    queryFn: () => getDashboardIndicators(month),
  });

  const data = indicatorsQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.monthRow}>
        <IconButton icon="chevron-left" onPress={() => setMonth(shiftMonth(month, -1))} accessibilityLabel="Mês anterior" />
        <Text variant="titleMedium">{formatMonthLabel(month)}</Text>
        <IconButton
          icon="chevron-right"
          disabled={isCurrentMonth}
          onPress={() => setMonth(shiftMonth(month, 1))}
          accessibilityLabel="Próximo mês"
        />
      </View>

      {indicatorsQuery.error ? (
        <Text style={styles.muted}>Não foi possível carregar os indicadores.</Text>
      ) : indicatorsQuery.isLoading || !data ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <View style={styles.kpiRow}>
            <Card style={styles.kpiCard}>
              <Card.Content>
                <Text variant="labelMedium" style={styles.muted}>
                  Receita
                </Text>
                <Text variant="titleMedium">{formatCurrencyBRL(data.revenue)}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.kpiCard}>
              <Card.Content>
                <Text variant="labelMedium" style={styles.muted}>
                  A receber
                </Text>
                <Text variant="titleMedium">{formatCurrencyBRL(data.toReceive)}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.kpiCard}>
              <Card.Content>
                <Text variant="labelMedium" style={styles.muted}>
                  Despesas
                </Text>
                <Text variant="titleMedium">{formatCurrencyBRL(data.expenses)}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.kpiCard}>
              <Card.Content>
                <Text variant="labelMedium" style={styles.muted}>
                  Lucro
                </Text>
                <Text variant="titleMedium" style={data.profit < 0 ? styles.negative : undefined}>
                  {formatCurrencyBRL(data.profit)}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Produtos mais vendidos (receita)
              </Text>
              <BarListChart
                items={data.topProducts.map((p) => ({
                  key: p.name,
                  label: p.name,
                  value: p.revenue,
                  highlighted: false,
                }))}
                emptyMessage="Nenhuma venda neste mês."
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Categorias
              </Text>
              <BarListChart
                items={data.categories.map((c) => ({
                  key: c.name,
                  label: `${c.name} (${formatPercent(c.percentage)})`,
                  value: c.revenue,
                }))}
                emptyMessage="Nenhuma venda neste mês."
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Clientes que mais compraram
              </Text>
              <BarListChart
                items={data.topCustomers.map((c) => ({
                  key: c.name,
                  label: c.name,
                  value: c.revenue,
                }))}
                emptyMessage="Nenhuma venda para cliente identificado neste mês."
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Lucro mensal (últimos 12 meses)
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                Receita − despesas, por mês
              </Text>
              <BarListChart
                items={data.profitHistory.map((point) => ({
                  key: point.month,
                  label: formatMonthLabel(point.month),
                  value: point.profit,
                  highlighted: point.month === month,
                }))}
                emptyMessage="Sem dados."
              />
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

export default function DashboardScreen() {
  return (
    <RequireRole role="ADMIN">
      <DashboardContent />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loading: { marginTop: 32 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: { flexBasis: '48%', flexGrow: 1 },
  card: { marginTop: 4 },
  cardTitle: { marginBottom: 8 },
  muted: { opacity: 0.7 },
  negative: { color: '#A74C39' },
});
