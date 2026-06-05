import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useProjectStore } from '@/stores';
import { authService } from '@/services';
import { Icon } from '@/components/ui/Icon';

// ─── Theme constant (matches HomeScreen) ──────────────────────────────────────
const HERO_COLOR = '#1A56DB';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const vendor = useAuthStore((s) => s.vendor);
  const setVendor = useAuthStore((s) => s.setVendor);
  const logout = useAuthStore((s) => s.logout);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [refreshing, setRefreshing] = React.useState(false);
  const [justChecked, setJustChecked] = React.useState(false);

  // ── unchanged logic ──────────────────────────────────────────────────────────
  const checkApproval = async () => {
    if (!vendor?.email || !activeProject?.baseUrl) return;
    setRefreshing(true);
    setJustChecked(false);
    try {
      const latest = await authService.findVendorByEmail(
        activeProject.baseUrl,
        vendor.email,
      );
      if (latest) {
        const updatedVendor = {
          ...vendor,
          isApproved: latest.isApproved ?? false,
        };
        setVendor(updatedVendor);
        if (latest.isApproved) {
          router.replace('/(tabs)');
          return;
        }
      }
    } catch {
      // ignore — just show "still waiting"
    }
    setJustChecked(true);
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={checkApproval}
          tintColor={HERO_COLOR}
        />
      }
    >
      {/* ── Hero header (mirrors HomeScreen hero) ─────────────────────────── */}
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        {/* Top row: back / sign-out */}
        <View style={styles.topRow}>
          <View style={styles.statusChip}>
            <View style={styles.statusDot} />
            <Text style={styles.statusChipText}>Pending Review</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.iconBtn}
            activeOpacity={0.8}
          >
            <Icon name="log-out" size={17} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        {/* Hourglass icon */}
        <View style={styles.heroIconWrap}>
          <Text style={styles.heroIcon}>⏳</Text>
        </View>

        <Text style={styles.heroTitle}>Awaiting Approval</Text>
        <Text style={styles.heroSubtitle}>
          Your account is under review. An admin will approve your vendor access
          shortly.
        </Text>
      </View>

      {/* ── Body content ──────────────────────────────────────────────────── */}
      <View style={styles.body}>
        {/* Vendor info card */}
        {vendor?.name ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {vendor?.initials ?? 'V'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>Registered as</Text>
                <Text style={styles.cardName}>{vendor.name}</Text>
                <Text style={styles.cardEmail}>{vendor.email}</Text>
              </View>
              {/* Pending badge */}
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Steps card */}
        <View style={styles.card}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          {[
            {
              icon: 'check-circle',
              text: 'Your account has been created successfully.',
            },
            { icon: 'clock', text: 'An admin is reviewing your registration.' },
            {
              icon: 'unlock',
              text: 'Once approved, you will get full access.',
            },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[styles.stepIconWrap, i === 0 && styles.stepIconDone]}
              >
                <Icon
                  name={step.icon as any}
                  size={15}
                  color={i === 0 ? '#fff' : HERO_COLOR}
                  strokeWidth={2}
                />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* "Still waiting" feedback */}
        {justChecked && !refreshing ? (
          <View style={styles.noticeCard}>
            <Icon name="info" size={15} color="#92400E" strokeWidth={2} />
            <Text style={styles.noticeText}>
              Not approved yet — please check back later.
            </Text>
          </View>
        ) : null}

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, refreshing && styles.primaryBtnDisabled]}
          onPress={checkApproval}
          disabled={refreshing}
          activeOpacity={0.85}
        >
          {refreshing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="refresh-cw" size={16} color="#fff" strokeWidth={2} />
              <Text style={styles.primaryBtnText}>Check Approval Status</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Hint */}
        <Text style={styles.hint}>
          You can also pull down to refresh at any time.
        </Text>

        {/* Sign out link */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutBtnText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  // ── Hero (matches HomeScreen exactly) ─────────────────────────────────────
  hero: {
    backgroundColor: HERO_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroCircle2: {
    position: 'absolute',
    right: 50,
    top: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Top row
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
  },
  statusChipText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero icon & text
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroIcon: {
    fontSize: 34,
  },
  heroTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    padding: 20,
    paddingTop: 24,
    gap: 14,
    alignItems: 'stretch',
  },

  // ── Shared card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Vendor info card internals
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: HERO_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 16,
    color: '#fff',
  },
  cardLabel: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  cardName: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 15,
    color: '#1F242A',
  },
  cardEmail: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 12,
    color: '#6B6969',
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignSelf: 'flex-start',
  },
  pendingBadgeText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 11,
    color: '#92400E',
  },

  // Steps card internals
  stepsTitle: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: '#1F242A',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: `${HERO_COLOR}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: '#22C55E',
  },
  stepText: {
    fontFamily: 'Manrope',
    fontWeight: '500',
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 19,
  },

  // Notice
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },

  // Primary button (matches HomeScreen's HERO_COLOR CTA)
  primaryBtn: {
    height: 52,
    backgroundColor: HERO_COLOR,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: HERO_COLOR,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
  },

  // Hint & logout
  hint: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  logoutBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  logoutBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    color: '#6B6969',
  },
});
