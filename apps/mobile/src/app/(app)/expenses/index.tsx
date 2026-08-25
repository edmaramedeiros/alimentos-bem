import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text } from 'react-native-paper';

import { listExpenses } from '@/api/expenses';
import { RequireRole } from '@/components/require-role';
import { expenseCategoryLabel, formatDateBR } from '@/utils/format';

function ExpensesList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['expenses'], queryFn: listExpenses });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }, [queryClient])
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
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.creditorName}
            description={`${formatDateBR(item.expenseDate)} · ${expenseCategoryLabel(item.category)} · ${item.payingCompanyName}`}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma despesa lançada ainda.</Text>}
      />
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
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
