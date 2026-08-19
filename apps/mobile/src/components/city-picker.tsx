import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, List, Portal, Searchbar, Text } from 'react-native-paper';

import municipiosPorUf from '@/data/ibge-municipios.json';

const MUNICIPIOS: Record<string, string[]> = municipiosPorUf;

export function CityPicker({ value, onChange, uf }: { value: string; onChange: (city: string) => void; uf: string }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const cities = uf ? (MUNICIPIOS[uf] ?? []) : [];
  const filteredCities = useMemo(() => {
    if (!search.trim()) return cities;
    const normalized = search.trim().toLowerCase();
    return cities.filter((city) => city.toLowerCase().includes(normalized));
  }, [cities, search]);

  const open = () => {
    setSearch('');
    setVisible(true);
  };

  return (
    <View style={{ marginTop: 8, flex: 1 }}>
      <Button mode="outlined" onPress={open} disabled={!uf} style={{ alignSelf: 'stretch' }} contentStyle={styles.buttonContent}>
        {value || 'Cidade'}
      </Button>
      {!uf && (
        <HelperText type="info" visible>
          Selecione a UF primeiro
        </HelperText>
      )}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title>Selecionar cidade</Dialog.Title>
          <View style={styles.searchWrapper}>
            <Searchbar placeholder="Buscar cidade" value={search} onChangeText={setSearch} />
          </View>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <FlatList
              data={filteredCities}
              keyExtractor={(city) => city}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                />
              )}
              ListEmptyComponent={<Text style={styles.empty}>Nenhuma cidade encontrada.</Text>}
            />
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContent: { justifyContent: 'flex-start' },
  dialog: { maxHeight: '80%' },
  searchWrapper: { paddingHorizontal: 24, paddingBottom: 8 },
  dialogScroll: { maxHeight: 400 },
  empty: { padding: 16, opacity: 0.6, textAlign: 'center' },
});
