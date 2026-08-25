import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, FAB, List, Menu, Searchbar, Text } from 'react-native-paper';

import { listCustomers } from '@/api/customers';

export default function CustomersScreen() {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);
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

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const customer of data ?? []) {
      if (customer.city) cities.add(customer.city);
    }
    return Array.from(cities).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const filteredCustomers = useMemo(() => {
    if (!cityFilter) return data ?? [];
    return (data ?? []).filter((customer) => customer.city === cityFilter);
  }, [data, cityFilter]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar cliente por nome"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <View style={styles.filters}>
        <Menu
          visible={cityMenuVisible}
          onDismiss={() => setCityMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCityMenuVisible(true)} style={styles.filterButton}>
              {cityFilter ? `Município: ${cityFilter}` : 'Município: todos'}
            </Button>
          }
        >
          <Menu.Item
            title="Todos"
            onPress={() => {
              setCityFilter(null);
              setCityMenuVisible(false);
            }}
          />
          {cityOptions.map((city) => (
            <Menu.Item
              key={city}
              title={city}
              onPress={() => {
                setCityFilter(city);
                setCityMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

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
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.phone ?? 'sem telefone'}${item.city ? ` · ${item.city}` : ''}${item.active ? '' : ' · inativo'}`}
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
  search: { margin: 16, marginBottom: 8 },
  filters: { paddingHorizontal: 16, paddingBottom: 8 },
  filterButton: { alignSelf: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
