import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Colors, Radius, Shadows } from '@/constants/tokens';
import { useAuthStore } from '@/stores';

const MENU_ITEMS = [
  { icon: 'token',    label: 'Token Redemption', sub: 'View and manage redemptions', href: '/settings/token-redemption' },
  { icon: 'projects', label: 'Projects',          sub: 'Switch active project',        href: '/settings/select-project' },
  { icon: 'settings', label: 'Preferences',       sub: 'App settings & organization',  href: '/settings/preferences' },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vendor, logout } = useAuthStore();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <TouchableOpacity
          onPress={() => router.push('/settings/profile')}
          style={styles.profileCard}
          activeOpacity={0.8}
        >
          <Avatar initials={vendor?.initials ?? 'AL'} size={46} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{vendor?.name ?? 'Aadarsha Lamichhane'}</Text>
            <Text style={styles.profileRole}>Vendor · Relief Nepal 2025</Text>
          </View>
          <Icon name="chevron-right" size={15} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Wallet */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>WALLET ADDRESS</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAddr}>{vendor?.walletAddress ?? '0x5e68qwhs73...37455'}</Text>
            <Icon name="copy" size={15} color={Colors.textMuted} />
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map(({ icon, label, sub, href }, i) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(href as any)}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconWrap}>
                <Icon name={icon} size={16} color="#6B7280" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{label}</Text>
                <Text style={styles.menuSub}>{sub}</Text>
              </View>
              <Icon name="chevron-right" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
          style={styles.logoutCard}
          activeOpacity={0.8}
        >
          <View style={styles.logoutIcon}>
            <Icon name="logout" size={16} color={Colors.error} />
          </View>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 18, color: Colors.textPrimary },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  profileCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    ...Shadows.card,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  profileRole: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted },

  walletCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  walletLabel: {
    fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6,
  },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletAddr: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: Colors.textBody },

  menuCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 9, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontFamily: 'Manrope', fontWeight: '600', fontSize: 13, color: Colors.textPrimary, marginBottom: 1 },
  menuSub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted },

  logoutCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#FEE2E2',
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13,
  },
  logoutIcon: {
    width: 36, height: 36, borderRadius: 9, backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontFamily: 'Manrope', fontWeight: '600', fontSize: 13, color: Colors.error },
});
