import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BeneficiaryRow } from '@/components/ui/BeneficiaryRow';
import { Colors, Radius } from '@/constants/tokens';
import { MOCK_BENEFICIARIES } from '@/mocks';

const TABS = [
  { id: 'online',  label: 'Online' },
  { id: 'offline', label: 'Offline' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BeneficiariesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState<TabId>('online');

  const online = MOCK_BENEFICIARIES.filter(b => b.isOnline);
  const offline = MOCK_BENEFICIARIES.filter(b => !b.isOnline);
  const shown = activeTab === 'online' ? online : offline;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Beneficiaries</Text>
          <Text style={styles.totalLabel}>{MOCK_BENEFICIARIES.length} total</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            const count = tab.id === 'online' ? online.length : offline.length;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={shown}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BeneficiaryRow beneficiary={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexShrink: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 0,
  },
  headerTitle: {
    fontFamily: 'Manrope', fontWeight: '700', fontSize: 18, color: Colors.textPrimary,
  },
  totalLabel: {
    fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: Colors.textMuted,
  },
  tabLabelActive: {
    fontWeight: '700', color: Colors.primary,
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textMuted,
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
