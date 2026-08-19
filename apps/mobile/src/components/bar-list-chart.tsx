import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { formatCurrencyBRL } from '@/utils/format';

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  highlighted?: boolean;
};

export function BarListChart({ items, emptyMessage }: { items: BarListItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <View>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 2 : 0)}%` },
                item.highlighted && styles.barFillHighlighted,
              ]}
            />
          </View>
          <Text style={styles.value}>{formatCurrencyBRL(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { width: 96, fontSize: 13 },
  barTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: '#ECCFB1', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#C6C664', borderRadius: 7 },
  barFillHighlighted: { backgroundColor: '#70754D' },
  value: { width: 92, textAlign: 'right', fontSize: 13, fontWeight: '600' },
  empty: { opacity: 0.6, paddingVertical: 16, textAlign: 'center' },
});
