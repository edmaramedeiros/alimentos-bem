import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Searchbar, Text } from 'react-native-paper';

import { listCustomers } from '@/api/customers';

export default function CustomersScreen() {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', query],
    queryFn: () => listCustomers(query || undefined),
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }, [queryClient])
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar cliente por nome"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text>Não foi possível carregar os clientes.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.phone ?? 'sem telefone'}${item.active ? '' : ' · inativo'}`}
              onPress={() => router.push(`/customers/${item.id}`)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente cadastrado ainda.</Text>}
        />
      )}

      <FAB icon="plus" style={styles.fab} label="Novo cliente" onPress={() => router.push('/customers/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
