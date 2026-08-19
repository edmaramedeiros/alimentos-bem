import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Menu, Text } from 'react-native-paper';

import { getDailySales, getMonthlySales } from '@/api/sales';
import { BarListChart } from '@/components/bar-list-chart';
import { VendedorPicker } from '@/components/vendedor-picker';
import { useAuthStore } from '@/store/auth-store';
import { formatMonthLabel } from '@/utils/format';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [vendedorId, setVendedorId] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);

  const monthlyQuery = useQuery({
    queryKey: ['sales', 'dashboard', 'monthly', vendedorId ?? 'self'],
    queryFn: () => getMonthlySales(vendedorId),
  });

  const months = monthlyQuery.data?.map((point) => point.month) ?? [];
  const effectiveMonth = selectedMonth && months.includes(selectedMonth) ? selectedMonth : months[0];

  const dailyQuery = useQuery({
    queryKey: ['sales', 'dashboard', 'daily', vendedorId ?? 'self', effectiveMonth],
    queryFn: () => getDailySales(effectiveMonth as string, vendedorId),
    enabled: !!effectiveMonth,
  });

  const dailyItems = (dailyQuery.data ?? []).map((point) => ({
    key: String(point.day),
    label: `Dia ${String(point.day).padStart(2, '0')}`,
    value: point.total,
  }));

  const monthlyItems = (monthlyQuery.data ?? []).map((point) => ({
    key: point.month,
    label: formatMonthLabel(point.month),
    value: point.total,
    highlighted: point.month === effectiveMonth,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Olá, {user?.name}</Text>
      <Text variant="bodyMedium" style={styles.role}>
        {isAdmin ? 'Administradora' : 'Vendedora'}
      </Text>

      {isAdmin && (
        <View style={styles.vendedorPicker}>
          <VendedorPicker value={vendedorId} onChange={setVendedorId} />
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium">Vendas diárias</Text>
            {months.length > 0 && (
              <Menu
                visible={monthMenuVisible}
                onDismiss={() => setMonthMenuVisible(false)}
                anchor={
                  <Button mode="text" onPress={() => setMonthMenuVisible(true)} compact>
                    {effectiveMonth ? formatMonthLabel(effectiveMonth) : ''}
                  </Button>
                }
              >
                {months.map((month) => (
                  <Menu.Item
                    key={month}
                    title={formatMonthLabel(month)}
                    onPress={() => {
                      setSelectedMonth(month);
                      setMonthMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            )}
          </View>
          {monthlyQuery.isLoading || dailyQuery.isLoading ? (
            <ActivityIndicator style={styles.loading} />
          ) : (
            <BarListChart items={dailyItems} emptyMessage="Nenhuma venda registrada ainda." />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitleSpaced}>
            Vendas mensais
          </Text>
          {monthlyQuery.isLoading ? (
            <ActivityIndicator style={styles.loading} />
          ) : (
            <BarListChart items={monthlyItems} emptyMessage="Nenhuma venda registrada ainda." />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  role: { opacity: 0.7, marginBottom: 16 },
  vendedorPicker: { alignSelf: 'flex-start', marginBottom: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleSpaced: { marginBottom: 8 },
  loading: { marginVertical: 24 },
});
