import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Button } from '@/components/ui/Button';
import { Colors, Radius } from '@/constants/tokens';
import { MOCK_REDEMPTIONS } from '@/mocks';
import type { RedemptionStatus, RedemptionRequest } from '@/types';

const statusStyle = (s: RedemptionStatus): { color: string; bg: string; border: string } => ({
  approved: { color: Colors.success,  bg: '#F0FDF4', border: '#BBF7D0' },
  pending:  { color: '#D97706',       bg: '#FFFBEB', border: '#FDE68A' },
  rejected: { color: Colors.error,    bg: '#FEF2F2', border: '#FECACA' },
}[s] ?? { color: Colors.textMuted, bg: Colors.bg, border: Colors.border });

export default function TokenRedemptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = React.useState<RedemptionRequest[]>(MOCK_REDEMPTIONS);
  const [showModal, setShowModal] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const approved = history.filter(h => h.status === 'approved').length;
  const pending  = history.filter(h => h.status === 'pending').length;
  const available = 45;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setAmount('');
    }, 1500);
  };

  const STATS = [
    { label: 'Approved', value: approved, icon: 'check-circle', accent: Colors.success, bg: '#F0FDF4' },
    { label: 'Pending',  value: pending,  icon: 'clock',        accent: '#D97706',       bg: '#FFFBEB' },
    { label: 'Available', value: available, icon: 'coin',        accent: Colors.primary,  bg: Colors.primarySubtle },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Token Redemptions" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(({ label, value, icon, accent, bg }) => (
            <View key={label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: bg }]}>
                <Icon name={icon} size={14} color={accent} />
              </View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        <SectionLabel>Redemption History</SectionLabel>
        <View style={{ gap: 6 }}>
          {history.map(item => {
            const ss = statusStyle(item.status);
            return (
              <View key={item.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyAmount}>{item.amount}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
                  <Text style={[styles.statusText, { color: ss.color }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="+ Redemption Request" onPress={() => setShowModal(true)} />
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            {submitted ? (
              <View style={styles.successBlock}>
                <View style={[styles.statIcon, { backgroundColor: '#F0FDF4', width: 48, height: 48, borderRadius: 16 }]}>
                  <Icon name="check" size={24} color={Colors.success} strokeWidth={2.5} />
                </View>
                <Text style={styles.successTitle}>Request Submitted</Text>
                <Text style={styles.successSub}>Your redemption request is being processed.</Text>
              </View>
            ) : (
              <>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Redemption Request</Text>
                <Text style={styles.sheetSub}>Enter the amount of RAHAT tokens to redeem.</Text>

                <Text style={styles.inputLabel}>AMOUNT (RAHAT)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 10"
                  keyboardType="number-pad"
                  style={styles.amountInput}
                  placeholderTextColor={Colors.textMuted}
                />

                <View style={styles.balanceNote}>
                  <Text style={styles.balanceNoteLabel}>Available balance</Text>
                  <Text style={styles.balanceNoteVal}>{available} RAHAT</Text>
                </View>

                <View style={{ gap: 8 }}>
                  <Button
                    label="Submit Request"
                    onPress={handleSubmit}
                    disabled={!amount || Number(amount) <= 0}
                  />
                  <Button label="Cancel" variant="ghost" onPress={() => setShowModal(false)} />
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 8 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: '#F3F4F6', padding: 10, gap: 6,
  },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 22, color: Colors.textPrimary, lineHeight: 24 },
  statLabel: { fontFamily: 'Manrope', fontSize: 10, color: Colors.textMuted },

  historyItem: {
    backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6',
    paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  historyAmount: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 13, color: Colors.textPrimary, marginBottom: 2 },
  historyDate: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted },
  statusBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: Colors.surface },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface, borderRadius: 20, borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0, padding: 24, paddingBottom: 40,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 17, color: Colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted, marginBottom: 20 },
  inputLabel: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  amountInput: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, fontFamily: 'Roboto', fontSize: 15, fontWeight: '500',
    color: Colors.textPrimary, backgroundColor: Colors.bg, marginBottom: 16,
  },
  balanceNote: {
    backgroundColor: '#F8FAFF', borderRadius: 10, borderWidth: 1, borderColor: '#DBEAFE',
    paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row',
    justifyContent: 'space-between', marginBottom: 20,
  },
  balanceNoteLabel: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textSecondary },
  balanceNoteVal: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, color: Colors.primary },

  successBlock: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  successTitle: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 17, color: Colors.textPrimary },
  successSub: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
