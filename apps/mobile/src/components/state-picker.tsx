import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu } from 'react-native-paper';

import estados from '@/data/ibge-estados.json';

const ESTADOS = estados as { sigla: string; nome: string }[];

export function StatePicker({ value, onChange }: { value: string; onChange: (uf: string) => void }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const selected = ESTADOS.find((e) => e.sigla === value);

  return (
    <View style={{ marginTop: 8 }}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)} style={{ alignSelf: 'stretch' }}>
            {selected ? selected.sigla : 'UF'}
          </Button>
        }
      >
        {ESTADOS.map((estado) => (
          <Menu.Item
            key={estado.sigla}
            title={`${estado.sigla} - ${estado.nome}`}
            onPress={() => {
              onChange(estado.sigla);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}
