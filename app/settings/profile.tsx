//rahat-project/src/app/settings/profile.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores';

// ── Design tokens (mirrors SettingsScreen) ────────────────────
const HERO = '#1A56DB';
const HERO_DARK = '#1344B8';
const BG = '#F0F4FA';
const SURFACE = '#FFFFFF';
const BORDER_LT = '#F3F4F6';
const TEXT_PRI = '#111827';
const TEXT_SEC = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const SUCCESS = '#22C55E';
const RED = '#DC2626';
const RED_BG = '#FEF2F2';
const RED_BORDER = '#FEE2E2';

const CURVE_H = 28;

// ── Helpers ───────────────────────────────────────────────────
const shortHash = (hash?: string | null): string =>
  hash ? `${hash.slice(0, 6)}……${hash.slice(-6)}` : '—';

const getProjectName = (): string | null => {
  try {
    const raw = localStorage.getItem('rahat-project');
    const parsed = JSON.parse(raw ?? '{}');
    return parsed?.state?.activeProject?.name ?? null;
  } catch {
    return null;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const vendor = useAuthStore((s) => s.vendor);

  const name = vendor?.name;
  const phone = vendor?.phone;
  const email = vendor?.email;
  const [activeProjectName, setActiveProject] = React.useState<string | null>(
    null,
  );
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    setActiveProject(getProjectName());
  }, []);

  function handleCopy() {
    if (!vendor?.walletAddress) return;
    Clipboard.setString(vendor.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HERO} />

      {/* ── Blue hero header ── */}
      <View style={styles.hero}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <View style={styles.titleRow}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Icon name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleCenter}>
            <Text style={styles.heroTitle}>Profile</Text>
            <Text style={styles.heroSub}>Manage your details</Text>
          </View>
        </View>

        {/* Avatar sits on the curve boundary */}
        <View style={styles.avatarFloatWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {vendor?.initials ?? 'AL'}
            </Text>
          </View>
        </View>

        <View style={styles.curveNotch} />
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Name + role under avatar */}
        <View style={styles.nameBlock}>
          <Text style={styles.profileName}>{name || vendor?.name || '—'}</Text>
          <Text style={styles.profileRole}>
            {vendor?.role ?? 'Vendor'} ·{' '}
            {activeProjectName ?? 'No Active Project'}
          </Text>
        </View>

        {/* ── Personal info ── */}
        <Text style={styles.sectionLabel}>Personal Info</Text>
        <View style={styles.card}>
          {(
            [
              { label: 'Full Name', value: name },
              { label: 'Phone', value: phone },
              { label: 'Email', value: email },
            ] as {
              label: string;
              value: string;
            }[]
          ).map(({ label, value }, i, arr) => (
            <View
              key={label}
              style={[
                styles.fieldRow,
                i < arr.length - 1 && styles.fieldDivider,
              ]}
            >
              <Text style={styles.fieldLabel}>{label}</Text>

              <Text style={styles.fieldValue}>{value || '—'}</Text>
            </View>
          ))}
        </View>

        {/* ── Wallet ── */}
        <Text style={styles.sectionLabel}>Wallet</Text>
        <View style={styles.card}>
          <View style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIconWrap}>
                <Icon name="wallet" size={16} color={HERO} />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Wallet Address</Text>
                <Text style={styles.walletAddr}>
                  {shortHash(vendor?.walletAddress)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.copyBtn, copied && styles.copyBtnActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Account meta ── */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          {(
            [
              { label: 'Role', value: vendor?.role },
              { label: 'Active Project', value: activeProjectName },
            ] as { label: string; value?: string | null }[]
          ).map(({ label, value }, i, arr) => (
            <View
              key={label}
              style={[
                styles.metaRow,
                i < arr.length - 1 && styles.fieldDivider,
              ]}
            >
              <Text style={styles.metaKey}>{label}</Text>
              <Text style={styles.metaVal}>{value ?? '—'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // ── Hero ─────────────────────────────────────────────────────
  hero: {
    backgroundColor: HERO,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  circle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute',
    right: 55,
    top: 25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circle3: {
    position: 'absolute',
    left: -30,
    bottom: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: { flex: 1, alignItems: 'center' },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  editToggle: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editToggleText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Avatar floats on the curve seam
  avatarFloatWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: -38,
    zIndex: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: HERO,
  },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: HERO },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: HERO_DARK,
    borderWidth: 2,
    borderColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curveNotch: {
    height: CURVE_H,
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginHorizontal: -20,
  },

  // ── Scroll / content ─────────────────────────────────────────
  scroll: { flex: 1, marginTop: -CURVE_H, zIndex: 5 },
  content: {
    paddingTop: CURVE_H + 46, // extra space for floating avatar
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 0,
  },

  // Name block under avatar
  nameBlock: { alignItems: 'center', marginBottom: 28, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '700', color: TEXT_PRI },
  profileRole: { fontSize: 12, color: TEXT_MUTED },

  // ── Section label ─────────────────────────────────────────────
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
    paddingHorizontal: 2,
  },

  // ── Card ─────────────────────────────────────────────────────
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LT,
    overflow: 'hidden',
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 13 },
  fieldDivider: { borderBottomWidth: 1, borderBottomColor: BORDER_LT },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: { fontSize: 14, fontWeight: '500', color: TEXT_PRI },
  fieldInput: {
    fontSize: 14,
    color: TEXT_PRI,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  // ── Wallet row ────────────────────────────────────────────────
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  walletIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  walletAddr: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRI,
    letterSpacing: 0.3,
  },
  copyBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexShrink: 0,
  },
  copyBtnActive: { backgroundColor: '#D1FAE5' },
  copyBtnText: { fontSize: 12, fontWeight: '700', color: TEXT_SEC },
  copyBtnTextActive: { color: '#16A34A' },

  // ── Meta rows ────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  metaKey: { fontSize: 13, color: TEXT_SEC },
  metaVal: { fontSize: 13, fontWeight: '600', color: TEXT_PRI },

  // ── Save button ───────────────────────────────────────────────
  saveBtn: {
    marginTop: 28,
    backgroundColor: HERO,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
