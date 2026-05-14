import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Clipboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

// ── Design tokens (mirrors BeneficiariesScreen) ───────────────
const HERO       = '#1A56DB';
const HERO_DARK  = '#1344B8';
const BG         = '#F0F4FA';
const SURFACE    = '#FFFFFF';
const BORDER     = '#E5E7EB';
const BORDER_LT  = '#F3F4F6';
const TEXT_PRI   = '#111827';
const TEXT_SEC   = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const SUCCESS    = '#22C55E';
const RED        = '#DC2626';
const RED_BG     = '#FEF2F2';
const RED_BORDER = '#FEE2E2';

const CURVE_H = 28;

// ── Menu items ────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    icon: '💎', label: 'Token Redemption',
    sub: 'View and manage redemptions',
    href: '/settings/token-redemption',
    iconBg: '#EFF6FF', iconColor: HERO,
    badge: '12 pending', badgeBg: '#EFF6FF', badgeColor: HERO_DARK,
  },
  {
    icon: '🗂', label: 'Projects',
    sub: 'Switch active project',
    href: '/settings/select-project',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
    badge: 'Relief Nepal', badgeBg: '#F0FDF4', badgeColor: '#15803D',
  },
  {
    icon: '⚙️', label: 'Preferences',
    sub: 'App settings & organization',
    href: '/settings/preferences',
    iconBg: '#F5F3FF', iconColor: '#7C3AED',
    badge: null,
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const walletAddress = '0x5e68qwhs73...37455';

  function handleCopy() {
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HERO} />

      {/* ── Blue Hero ── */}
      <View style={styles.hero}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* Title row */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heroTitle}>Settings</Text>
            <Text style={styles.heroSub}>Manage your account</Text>
          </View>
        </View>

        {/* Inverted curve notch */}
        <View style={styles.curveNotch} />
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/settings/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>AL</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Aadarsha Lamichhane</Text>
            <Text style={styles.profileRole}>Vendor · Relief Nepal 2025</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Wallet card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet address</Text>
          <View style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIconWrap}>
                <Text style={styles.walletIconText}>💳</Text>
              </View>
              <Text style={styles.walletAddr} numberOfLines={1}>{walletAddress}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.copyBtn, copied && styles.copyBtnActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}>
                {copied ? '✓ Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu card */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map(({ label, sub, href, iconBg, badge, badgeBg, badgeColor, icon }, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => router.push(href)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
                <Text style={styles.menuIconEmoji}>{icon}</Text>
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{label}</Text>
                <Text style={styles.menuSub}>{sub}</Text>
              </View>
              {badge && (
                <View style={[styles.menuBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.menuBadgeText, { color: badgeColor }]}>{badge}</Text>
                </View>
              )}
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App info card */}
        <View style={styles.infoCard}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.menuIconEmoji}>ℹ️</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>App version</Text>
            <Text style={styles.menuSub}>Humanitarian Portal v2.4.1</Text>
          </View>
          <View style={styles.latestBadge}>
            <Text style={styles.latestBadgeText}>Latest</Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={() => Alert.alert('Sign out', 'Are you sure?')}
          activeOpacity={0.8}
        >
          <View style={styles.logoutIconWrap}>
            <Text style={styles.menuIconEmoji}>🚪</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.logoutLabel}>Sign Out</Text>
            <Text style={styles.logoutSub}>End your current session</Text>
          </View>
          <Text style={[styles.chevron, { color: '#F87171' }]}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // ── Hero ──────────────────────────────────────────────────────
  hero: {
    backgroundColor: HERO,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  circle1: {
    position: 'absolute', right: -20, top: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute', right: 55, top: 25,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circle3: {
    position: 'absolute', left: -30, bottom: 40,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 3 },
  heroSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 17 },
  curveNotch: {
    height: CURVE_H,
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginHorizontal: -20,
     overflow: "hidden",
    position: "relative",
     paddingHorizontal: 20,
    paddingBottom: 36,
  },
  // ── Scroll / content ──────────────────────────────────────────
  scroll: { flex: 1, marginTop: -CURVE_H, zIndex: 5 },
  content: {
    paddingTop: CURVE_H + 4,
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Profile card ──────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_LT, padding: 16,
  },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', flexShrink: 0,
  },
  avatarText: { fontWeight: '700', fontSize: 16, color: HERO },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: SUCCESS, borderWidth: 2, borderColor: SURFACE,
  },
  profileInfo: { flex: 1 },
  profileName: { fontWeight: '700', fontSize: 15, color: TEXT_PRI, marginBottom: 2 },
  profileRole: { fontSize: 12, color: TEXT_MUTED },
  chevron: { fontSize: 22, color: TEXT_MUTED, lineHeight: 22 },

  // ── Wallet card ───────────────────────────────────────────────
  walletCard: {
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_LT, padding: 14,
    paddingHorizontal: 16,
  },
  walletLabel: {
    fontSize: 10, fontWeight: '700', color: TEXT_MUTED,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  walletRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  walletIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  walletIconText: { fontSize: 15 },
  walletAddr: { fontSize: 13, fontWeight: '500', color: TEXT_PRI, flex: 1 },
  copyBtn: {
    backgroundColor: '#F3F4F6', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, flexShrink: 0,
  },
  copyBtnActive: { backgroundColor: '#D1FAE5' },
  copyBtnText: { fontSize: 12, fontWeight: '600', color: TEXT_SEC },
  copyBtnTextActive: { color: '#16A34A' },

  // ── Menu card ─────────────────────────────────────────────────
  menuCard: {
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_LT, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: BORDER_LT },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  menuIconEmoji: { fontSize: 16 },
  menuText: { flex: 1 },
  menuLabel: { fontWeight: '600', fontSize: 13, color: TEXT_PRI, marginBottom: 2 },
  menuSub:   { fontSize: 11, color: TEXT_MUTED },
  menuBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  menuBadgeText: { fontSize: 11, fontWeight: '700' },

  // ── Info card ─────────────────────────────────────────────────
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER_LT,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  latestBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  latestBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },

  // ── Logout card ───────────────────────────────────────────────
  logoutCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: RED_BORDER,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  logoutIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: RED_BG,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoutLabel: { fontWeight: '600', fontSize: 13, color: RED, marginBottom: 2 },
  logoutSub:   { fontSize: 11, color: '#F87171' },
});
// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   Modal,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Avatar } from '@/components/ui/Avatar';
// import { Icon } from '@/components/ui/Icon';
// import { Colors, Radius, Shadows } from '@/constants/tokens';
// import { useAuthStore } from '@/stores';

// const MENU_ITEMS = [
//   { icon: 'token',    label: 'Token Redemption', sub: 'View and manage redemptions', href: '/settings/token-redemption' },
//   { icon: 'projects', label: 'Projects',          sub: 'Switch active project',        href: '/settings/select-project' },
//   { icon: 'settings', label: 'Preferences',       sub: 'App settings & organization',  href: '/settings/preferences' },
// ] as const;

// export default function SettingsScreen() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { vendor, logout } = useAuthStore();

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Settings</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Profile */}
//         <TouchableOpacity
//           onPress={() => router.push('/settings/profile')}
//           style={styles.profileCard}
//           activeOpacity={0.8}
//         >
//           <Avatar initials={vendor?.initials ?? 'AL'} size={46} />
//           <View style={styles.profileInfo}>
//             <Text style={styles.profileName}>{vendor?.name ?? 'Aadarsha Lamichhane'}</Text>
//             <Text style={styles.profileRole}>Vendor · Relief Nepal 2025</Text>
//           </View>
//           <Icon name="chevron-right" size={15} color={Colors.textMuted} />
//         </TouchableOpacity>

//         {/* Wallet */}
//         <View style={styles.walletCard}>
//           <Text style={styles.walletLabel}>WALLET ADDRESS</Text>
//           <View style={styles.walletRow}>
//             <Text style={styles.walletAddr}>{vendor?.walletAddress ?? '0x5e68qwhs73...37455'}</Text>
//             <Icon name="copy" size={15} color={Colors.textMuted} />
//           </View>
//         </View>

//         {/* Menu */}
//         <View style={styles.menuCard}>
//           {MENU_ITEMS.map(({ icon, label, sub, href }, i) => (
//             <TouchableOpacity
//               key={label}
//               onPress={() => router.push(href as any)}
//               style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
//               activeOpacity={0.75}
//             >
//               <View style={styles.menuIconWrap}>
//                 <Icon name={icon} size={16} color="#6B7280" />
//               </View>
//               <View style={styles.menuText}>
//                 <Text style={styles.menuLabel}>{label}</Text>
//                 <Text style={styles.menuSub}>{sub}</Text>
//               </View>
//               <Icon name="chevron-right" size={14} color={Colors.textMuted} />
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Logout */}
//         <TouchableOpacity
//           onPress={() => {
//             logout();
//             router.replace('/(auth)/login');
//           }}
//           style={styles.logoutCard}
//           activeOpacity={0.8}
//         >
//           <View style={styles.logoutIcon}>
//             <Icon name="logout" size={16} color={Colors.error} />
//           </View>
//           <Text style={styles.logoutText}>Sign Out</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: Colors.bg },
//   header: {
//     backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 14,
//     borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
//   },
//   headerTitle: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 18, color: Colors.textPrimary },
//   content: { padding: 16, gap: 12, paddingBottom: 40 },

//   profileCard: {
//     backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
//     padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
//     ...Shadows.card,
//   },
//   profileInfo: { flex: 1 },
//   profileName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
//   profileRole: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted },

//   walletCard: {
//     backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
//     paddingHorizontal: 16, paddingVertical: 14,
//   },
//   walletLabel: {
//     fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.textMuted,
//     letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6,
//   },
//   walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   walletAddr: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: Colors.textBody },

//   menuCard: {
//     backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
//     overflow: 'hidden',
//   },
//   menuItem: {
//     flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13,
//   },
//   menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
//   menuIconWrap: {
//     width: 36, height: 36, borderRadius: 9, backgroundColor: Colors.bg,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   menuText: { flex: 1 },
//   menuLabel: { fontFamily: 'Manrope', fontWeight: '600', fontSize: 13, color: Colors.textPrimary, marginBottom: 1 },
//   menuSub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted },

//   logoutCard: {
//     backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#FEE2E2',
//     flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13,
//   },
//   logoutIcon: {
//     width: 36, height: 36, borderRadius: 9, backgroundColor: '#FEF2F2',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   logoutText: { fontFamily: 'Manrope', fontWeight: '600', fontSize: 13, color: Colors.error },
// });
