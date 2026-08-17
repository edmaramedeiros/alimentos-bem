import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text } from 'react-native-paper';

import { listUsers } from '@/api/users';
import { RequireRole } from '@/components/require-role';

function UsersList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: listUsers });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
        <Text>Não foi possível carregar os usuários.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.role === 'ADMIN' ? 'Administradora' : 'Vendedora'}${item.active ? '' : ' · inativo'}`}
            onPress={() => router.push(`/users/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum usuário cadastrado ainda.</Text>}
      />
      <FAB icon="plus" style={styles.fab} label="Novo usuário" onPress={() => router.push('/users/new')} />
    </View>
  );
}

export default function UsersScreen() {
  return (
    <RequireRole role="ADMIN">
      <UsersList />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
