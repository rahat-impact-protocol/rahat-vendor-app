import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Colors } from '@/constants/tokens';
import { useOrgStore } from '@/stores';
import { MOCK_ORGANIZATIONS } from '@/mocks';
import type { Organization } from '@/types';

type OverlayState = 'none' | 'switching' | 'done';

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeOrg, setActiveOrg } = useOrgStore();

  const [showOrgSheet, setShowOrgSheet] = React.useState(false);
  const [overlay, setOverlay] = React.useState<OverlayState>('none');
  const [pendingOrg, setPendingOrg] = React.useState<Organization | null>(null);

  const handleOrgSelect = (org: Organization) => {
    if (org.id === activeOrg?.id) { setShowOrgSheet(false); return; }
    setPendingOrg(org);
    setShowOrgSheet(false);
    setOverlay('switching');
    setTimeout(() => {
      setActiveOrg(org);
      setOverlay('done');
      setTimeout(() => setOverlay('none'), 1800);
    }, 1600);
  };

  const APP_PREFS = [
    { label: 'Language',      value: 'English' },
    { label: 'Currency',      value: 'NPR' },
    { label: 'Notifications', value: 'On' },
  ];
  const SECURITY = [
    { label: 'Biometric Login', value: 'Enabled' },
    { label: 'Auto-lock',       value: '5 min' },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Preferences" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Organization ── */}
        <SectionLabel>Organization</SectionLabel>
        <View style={styles.card}>
          {/* Active org */}
          <View style={styles.orgRow}>
            <View style={[styles.orgAvatar, { backgroundColor: (activeOrg?.color ?? '#297AD6') + '20' }]}>
              <Text style={[styles.orgInitials, { color: activeOrg?.color ?? Colors.primary }]}>
                {activeOrg?.initials ?? 'UN'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>{activeOrg?.name ?? 'UNICEF Nepal'}</Text>
              <Text style={styles.orgMeta}>
                {activeOrg?.role ?? 'Vendor'} · {activeOrg?.projectCount ?? 3} project{(activeOrg?.projectCount ?? 3) > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.activeTag}><Text style={styles.activeTagText}>Active</Text></View>
          </View>
          <View style={styles.divider} />
          {/* Switch org */}
          <TouchableOpacity onPress={() => setShowOrgSheet(true)} style={styles.switchRow} activeOpacity={0.75}>
            <View style={styles.switchIcon}>
              <Icon name="arrow-lr" size={15} color="#6B7280" />
            </View>
            <Text style={styles.switchLabel}>Switch Organization</Text>
            <Icon name="chevron-right" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── App Preferences ── */}
        <View style={{ marginTop: 20 }}>
          <SectionLabel>App</SectionLabel>
          <View style={styles.card}>
            {APP_PREFS.map(({ label, value }, i) => (
              <View key={label} style={[styles.prefRow, i < APP_PREFS.length - 1 && styles.prefBorder]}>
                <Text style={styles.prefLabel}>{label}</Text>
                <View style={styles.prefVal}>
                  <Text style={styles.prefValText}>{value}</Text>
                  <Icon name="chevron-right" size={13} color="#E5E7EB" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Security ── */}
        <View style={{ marginTop: 20 }}>
          <SectionLabel>Security</SectionLabel>
          <View style={styles.card}>
            {SECURITY.map(({ label, value }, i) => (
              <View key={label} style={[styles.prefRow, i < SECURITY.length - 1 && styles.prefBorder]}>
                <Text style={styles.prefLabel}>{label}</Text>
                <View style={styles.prefVal}>
                  <Text style={styles.prefValText}>{value}</Text>
                  <Icon name="chevron-right" size={13} color="#E5E7EB" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Org Switcher Bottom Sheet ── */}
      <Modal visible={showOrgSheet} transparent animationType="slide" onRequestClose={() => setShowOrgSheet(false)}>
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowOrgSheet(false)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Switch Organization</Text>
            <Text style={styles.sheetSub}>
              You are a member of {MOCK_ORGANIZATIONS.length} organizations
            </Text>
            <View style={{ gap: 8 }}>
              {MOCK_ORGANIZATIONS.map(org => {
                const isActive = org.id === activeOrg?.id;
                return (
                  <TouchableOpacity
                    key={org.id}
                    onPress={() => handleOrgSelect(org)}
                    style={[
                      styles.orgCard,
                      isActive && { borderColor: org.color + '40', backgroundColor: org.color + '08' },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.orgAvatarLg, { backgroundColor: org.color + '20' }]}>
                      <Text style={[styles.orgInitialsLg, { color: org.color }]}>{org.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orgCardName}>{org.name}</Text>
                      <Text style={styles.orgCardMeta}>
                        {org.role} · {org.projectCount} project{org.projectCount > 1 ? 's' : ''}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={[styles.radioActive, { backgroundColor: org.color }]}>
                        <Icon name="check" size={10} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Switching overlay ── */}
      {overlay === 'switching' && (
        <View style={styles.overlay}>
          <View style={styles.overlayIcon}>
            <Icon name="arrow-lr" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.overlayTitle}>Switching Organization…</Text>
          <Text style={styles.overlaySub}>
            Loading <Text style={{ fontWeight: '700', color: Colors.primary }}>{pendingOrg?.name}</Text>
          </Text>
        </View>
      )}

      {/* ── Done overlay ── */}
      {overlay === 'done' && (
        <View style={styles.overlay}>
          <View style={[styles.overlayIcon, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="check" size={26} color={Colors.success} strokeWidth={2.5} />
          </View>
          <Text style={styles.overlayTitle}>Organization Switched!</Text>
          <Text style={styles.overlaySub}>
            Now in <Text style={{ fontWeight: '700', color: Colors.textBody }}>{activeOrg?.name}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  orgAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orgInitials: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 14 },
  orgName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  orgMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted },
  activeTag: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeTagText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.success },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  switchIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  switchLabel: { flex: 1, fontFamily: 'Manrope', fontWeight: '600', fontSize: 13, color: Colors.textBody },

  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  prefLabel: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '600', color: Colors.textBody },
  prefVal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prefValText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textMuted },

  // Sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface, borderRadius: 20, borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0, padding: 20, paddingBottom: 40,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted, marginBottom: 20 },
  orgCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA',
  },
  orgAvatarLg: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  orgInitialsLg: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 13 },
  orgCardName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  orgCardMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted },
  radioActive: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249,250,251,0.97)',
    alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 50,
  },
  overlayIcon: {
    width: 54, height: 54, borderRadius: 18, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  overlayTitle: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 17, color: Colors.textPrimary },
  overlaySub: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textMuted },
});
