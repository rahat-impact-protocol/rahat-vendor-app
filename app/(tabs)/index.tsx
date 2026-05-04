import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { Colors, Radius, Shadows } from '@/constants/tokens';
import { useAuthStore, useProjectStore, useOrgStore } from '@/stores';
import { MOCK_TRANSACTIONS } from '@/mocks';

const QUICK_ACTIONS = [
  { label: 'Charge',  icon: 'qr',    href: '/charge'    },
  { label: 'People',  icon: 'users',  href: '/beneficiaries' },
  { label: 'History', icon: 'token',  href: '/transactions'  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vendor = useAuthStore(s => s.vendor);
  const project = useProjectStore(s => s.activeProject);
  const org = useOrgStore(s => s.activeOrg);

  const recentTx = MOCK_TRANSACTIONS.slice(0, 4);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.vendorName}>
            {vendor?.name?.split(' ')[0] ?? 'Vendor'} {vendor?.name?.split(' ')[1]?.[0] ?? ''}.
          </Text>
        </View>
        <View style={styles.topBarRight}>
          {/* Bell */}
          <View style={styles.bellContainer}>
            <Icon name="bell" size={17} color="#6B7280" strokeWidth={1.75} />
            <View style={styles.bellDot} />
          </View>
          {/* Avatar → settings */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings')}
            style={styles.avatarBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitials}>{vendor?.initials ?? 'AL'}</Text>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance hero card */}
        <View style={styles.heroCard}>
          {/* Decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Org + project breadcrumb */}
          <View style={styles.breadcrumb}>
            <View style={styles.orgChip}>
              <Text style={styles.orgInitials}>{org?.initials ?? 'UN'}</Text>
            </View>
            <Text style={styles.orgName}>{org?.name ?? 'UNICEF Nepal'}</Text>
            <Icon name="chevron-right" size={10} color="rgba(255,255,255,0.25)" strokeWidth={2} />
            <Text style={styles.projectName}>{project?.name ?? 'Relief Nepal 2025'}</Text>
          </View>

          <Text style={styles.balanceLabel}>Rahat Balance</Text>
          <Text style={styles.balanceAmount}>
            {(project?.tokens ?? 12325).toLocaleString()}
          </Text>

          <View style={styles.heroFooter}>
            <Text style={styles.tokensAvailable}>tokens available</Text>
            <TouchableOpacity
              onPress={() => router.push('/settings/select-project')}
              style={styles.switchProjectBtn}
              activeOpacity={0.8}
            >
              <Icon name="arrow-lr" size={11} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
              <Text style={styles.switchProjectText}>Switch Project</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(({ label, icon, href }) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(href as any)}
              style={styles.actionBtn}
              activeOpacity={0.75}
            >
              <View style={styles.actionIcon}>
                <Icon name={icon} size={18} color={Colors.primary} strokeWidth={1.75} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => router.push('/transactions' as any)}
              style={styles.seeAll}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="arrow-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.txList}>
            {recentTx.map(tx => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  greeting: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted, marginBottom: 1 },
  vendorName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellContainer: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff',
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1.5, borderColor: Colors.primary + '30',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarInitials: {
    fontFamily: 'Manrope', fontWeight: '800', fontSize: 13,
    color: Colors.primary, lineHeight: 14,
  },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#16A34A', borderWidth: 2, borderColor: '#fff',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Hero card
  heroCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#1E3A5F',
    borderRadius: Radius.hero,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircle1: {
    position: 'absolute', right: -24, top: -24,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroCircle2: {
    position: 'absolute', right: 16, bottom: -32,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14,
  },
  orgChip: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: 'rgba(29,112,184,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  orgInitials: {
    fontFamily: 'Manrope', fontWeight: '800', fontSize: 8, color: '#93C5FD',
  },
  orgName: {
    fontFamily: 'Manrope', fontSize: 11, color: 'rgba(255,255,255,0.45)',
  },
  projectName: {
    fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)',
  },
  balanceLabel: {
    fontFamily: 'Manrope', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: 'Manrope', fontWeight: '800', fontSize: 36,
    color: '#fff', letterSpacing: -1, marginBottom: 12,
  },
  heroFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  tokensAvailable: {
    fontFamily: 'Manrope', fontSize: 12, color: 'rgba(255,255,255,0.35)',
  },
  switchProjectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10,
  },
  switchProjectText: {
    fontFamily: 'Manrope', fontSize: 11, fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0,
  },
  actionBtn: {
    flex: 1, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.card, padding: 14,
    alignItems: 'center', gap: 7,
    ...Shadows.card,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Manrope', fontWeight: '600', fontSize: 11, color: Colors.textBody,
  },

  // Section
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary,
  },
  seeAll: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  seeAllText: {
    fontFamily: 'Manrope', fontSize: 12, color: Colors.primary, fontWeight: '600',
  },
  txList: { gap: 6 },
});
