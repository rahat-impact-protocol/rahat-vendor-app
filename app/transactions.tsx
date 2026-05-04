import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { Colors } from '@/constants/tokens';
import { MOCK_TRANSACTIONS } from '@/mocks';
import type { Transaction } from '@/types';

type FilterId = 'all' | 'pending';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'pending', label: 'Pending' },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = React.useState<FilterId>('all');

  const all = MOCK_TRANSACTIONS;
  const pending = all.filter(t => t.status === 'pending');
  const shown = filter === 'all' ? all : pending;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Transactions" showBack />

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const isActive = f.id === filter;
          const count = f.id === 'all' ? all.length : pending.length;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
              <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={shown}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  filterRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  filterTabActive: { borderBottomColor: Colors.primary },
  filterLabel: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  filterLabelActive: { fontWeight: '700', color: Colors.primary },
  filterBadge: { backgroundColor: '#F3F4F6', borderRadius: 100, paddingHorizontal: 7, paddingVertical: 1 },
  filterBadgeActive: { backgroundColor: Colors.primary },
  filterBadgeText: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  filterBadgeTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 32 },
});
