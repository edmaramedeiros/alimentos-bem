import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, List, Text } from 'react-native-paper';

import { listExpenses } from '@/api/expenses';
import { RequireRole } from '@/components/require-role';
import { expenseCategoryLabel, formatCurrencyBRL, formatDateBR } from '@/utils/format';

const PAGE_SIZE = 20;

function ExpensesList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['expenses'], queryFn: listExpenses });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }, [queryClient])
  );

  const [page, setPage] = useState(0);
  const totalCount = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageExpenses = useMemo(
    () => (data ?? []).slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
    [data, currentPage]
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar as despesas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Despesas
      </Text>
      <FlatList
        data={pageExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.creditorName}
            description={`${formatDateBR(item.expenseDate)} · ${expenseCategoryLabel(item.category)} · ${item.payingCompanyName}`}
            right={() => <Text style={styles.amount}>{formatCurrencyBRL(item.amount)}</Text>}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma despesa lançada ainda.</Text>}
      />
      {totalCount > PAGE_SIZE && (
        <View style={styles.pagination}>
          <IconButton
            icon="chevron-left"
            disabled={currentPage === 0}
            onPress={() => setPage(currentPage - 1)}
            accessibilityLabel="Página anterior"
          />
          <Text>
            Página {currentPage + 1} de {totalPages}
          </Text>
          <IconButton
            icon="chevron-right"
            disabled={currentPage >= totalPages - 1}
            onPress={() => setPage(currentPage + 1)}
            accessibilityLabel="Próxima página"
          />
        </View>
      )}
      <FAB icon="plus" style={styles.fab} label="Nova despesa" onPress={() => router.push('/expenses/new')} />
    </View>
  );
}

export default function ExpensesScreen() {
  return (
    <RequireRole role="ADMIN">
      <ExpensesList />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { padding: 24, paddingBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  amount: { alignSelf: 'center', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
