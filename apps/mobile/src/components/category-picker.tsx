import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu, TextInput } from 'react-native-paper';

import { getProductCategories } from '@/api/products';

const SUGGESTED_CATEGORIES = ['Castanhas', 'Sementes', 'Frutas Secas', 'Granola', 'Outros'];

export function CategoryPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const categoriesQuery = useQuery({ queryKey: ['products', 'categories'], queryFn: getProductCategories });

  const categories = Array.from(new Set([...(categoriesQuery.data ?? []), ...SUGGESTED_CATEGORIES])).sort();

  if (customMode) {
    return (
      <TextInput
        label="Categoria"
        mode="outlined"
        value={value}
        onChangeText={onChange}
        style={{ marginTop: 8 }}
        right={<TextInput.Icon icon="format-list-bulleted" onPress={() => setCustomMode(false)} />}
      />
    );
  }

  return (
    <View style={{ marginTop: 8 }}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)} style={{ alignSelf: 'flex-start' }}>
            {value ? `Categoria: ${value}` : 'Selecionar categoria'}
          </Button>
        }
      >
        {categories.map((category) => (
          <Menu.Item
            key={category}
            title={category}
            onPress={() => {
              onChange(category);
              setMenuVisible(false);
            }}
          />
        ))}
        <Menu.Item
          title="Nova categoria..."
          onPress={() => {
            setMenuVisible(false);
            setCustomMode(true);
          }}
        />
      </Menu>
    </View>
  );
}
