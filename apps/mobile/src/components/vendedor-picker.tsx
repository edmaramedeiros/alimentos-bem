import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu } from 'react-native-paper';

import { listUsers } from '@/api/users';

export function VendedorPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (vendedorId: string | undefined) => void;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const users = (usersQuery.data ?? []).filter((u) => u.active);

  const selectedName = value ? users.find((u) => u.id === value)?.name : null;

  return (
    <View>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)} icon="account-switch">
            {selectedName ? `Vendedor: ${selectedName}` : 'Vendedor: todos'}
          </Button>
        }
      >
        <Menu.Item
          title="Todos"
          onPress={() => {
            onChange(undefined);
            setMenuVisible(false);
          }}
        />
        {users.map((u) => (
          <Menu.Item
            key={u.id}
            title={u.name}
            onPress={() => {
              onChange(u.id);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}
