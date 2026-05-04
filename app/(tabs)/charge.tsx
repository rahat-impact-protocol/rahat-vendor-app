import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Colors, Radius, Shadows } from '@/constants/tokens';
import { MOCK_BENEFICIARIES } from '@/mocks';
import type { Beneficiary } from '@/types';

type Step = 'input' | 'confirm' | 'otp' | 'success';

// ── OTP dots loader ──────────────────────────────────────────
const AnimatedDots: React.FC = () => {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setActive(x => (x + 1) % 6), 140);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={{
            width: 5, height: 5, borderRadius: 3,
            backgroundColor: i === active ? Colors.primary : '#E5E7EB',
          }}
        />
      ))}
    </View>
  );
};

export default function ChargeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = React.useState<Step>('input');
  const [phone, setPhone] = React.useState('');
  const [beneficiary, setBeneficiary] = React.useState<Beneficiary | null>(null);
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const otpRefs = React.useRef<(TextInput | null)[]>([]);

  const filledOtp = otp.filter(Boolean).length;

  const handleFindBeneficiary = async () => {
    if (phone.length < 7) return;
    setLoading(true);
    Keyboard.dismiss();
    // Simulate API call
    await new Promise(r => setTimeout(r, 600));
    const b = MOCK_BENEFICIARIES.find(b => b.isOnline) ?? MOCK_BENEFICIARIES[0];
    setBeneficiary({ ...b, phone });
    setLoading(false);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    setStep('otp');
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setOtpError(false);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyPress = (i: number, key: string) => {
    if (key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    if (filledOtp < 6) { setOtpError(true); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setStep('success');
  };

  const handleReset = () => {
    setStep('input');
    setPhone('');
    setBeneficiary(null);
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
  };

  // ── Success screen ──────────────────────────────────────────
  if (step === 'success') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <PageHeader title="Redeem Receipt" showBack onBack={handleReset} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>12</Text>
          </View>

          {/* Detail card */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.checkIcon}>
                <Icon name="check" size={20} color={Colors.primary} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.detailTitle}>Redeemed</Text>
                <Text style={styles.detailDate}>{new Date().toLocaleString()}</Text>
                <Text style={styles.receivedLabel}>Received</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              {[
                ['Name', beneficiary?.maskedName ?? 'Aadarsha L.'],
                ['Phone', `+977-${phone}`],
                ['Project', 'Relief Nepal'],
                ['Tx Hash', '0x5e68...455'],
              ].map(([k, v]) => (
                <View key={k} style={styles.detailCell}>
                  <Text style={styles.detailKey}>{k}</Text>
                  <Text style={styles.detailVal}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 8, marginTop: 4 }}>
            <Button label="View in Blockchain Explorer" variant="outline" icon="arrow-right" />
            <Button label="Back to Home" variant="ghost" onPress={handleReset} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── OTP screen ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <PageHeader title="Verify Beneficiary" showBack onBack={() => setStep('confirm')} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
            {/* Shield icon */}
            <View style={styles.shieldIcon}>
              <Icon name="shield" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.otpTitle}>Beneficiary Verification</Text>
            <Text style={styles.otpSub}>
              A 6-digit code has been sent to the beneficiary's phone{phone ? ` +977-${phone}` : ''}. Ask them to share it with you.
            </Text>

            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {otp.map((val, i) => (
                <TextInput
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  value={val}
                  onChangeText={v => handleOtpChange(i, v)}
                  onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(i, key)}
                  maxLength={1}
                  keyboardType="number-pad"
                  style={[
                    styles.otpBox,
                    val && styles.otpBoxFilled,
                    otpError && styles.otpBoxError,
                  ]}
                  textAlign="center"
                />
              ))}
            </View>

            {otpError && (
              <Text style={styles.otpError}>Please enter all 6 digits</Text>
            )}

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(filledOtp / 6) * 100}%` as any }]} />
            </View>

            {loading ? (
              <View style={styles.verifyingRow}>
                <AnimatedDots />
                <Text style={styles.verifyingText}>Verifying…</Text>
              </View>
            ) : (
              <Button
                label="Verify & Complete Charge"
                onPress={handleVerify}
                disabled={filledOtp < 6}
              />
            )}

            <Text style={styles.resendRow}>
              Didn't receive it?{' '}
              <Text style={styles.resendLink}>Resend code</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Confirm screen ──────────────────────────────────────────
  if (step === 'confirm' && beneficiary) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <PageHeader title="Confirm Charge" showBack onBack={() => setStep('input')} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmProfile}>
              <Avatar initials={beneficiary.initials} size={46} />
              <View>
                <Text style={styles.confirmName}>{beneficiary.maskedName}</Text>
                <Text style={styles.confirmPhone}>+977-{phone}</Text>
              </View>
            </View>

            {[
              ['Tokens Available', `${beneficiary.tokensAvailable}`],
              ['Tokens Approved', `${beneficiary.tokensApproved}`],
              ['Project', 'Relief Nepal 2025'],
            ].map(([k, v]) => (
              <View key={k} style={styles.confirmRow}>
                <Text style={styles.confirmKey}>{k}</Text>
                <Text style={styles.confirmVal}>{v}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Confirm & Charge" onPress={handleConfirm} loading={loading} />
          <Button label="Cancel" variant="ghost" onPress={() => setStep('input')} />
        </View>
      </View>
    );
  }

  // ── Input screen (default) ──────────────────────────────────
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>Phone number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.dialCode}>
              <Text style={styles.flag}>🇳🇵</Text>
              <Text style={styles.dialText}>+977</Text>
              <Icon name="chevron-down" size={13} color={Colors.textMuted} />
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              style={styles.phoneInput}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={{ marginTop: 24 }}>
            <Button
              label="Find Beneficiary"
              onPress={handleFindBeneficiary}
              disabled={phone.length < 7}
              loading={loading}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use another method</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Alt methods */}
          <View style={{ gap: 8 }}>
            {[
              { icon: 'qr',  label: 'Scan QR Code', sub: 'Open camera to scan beneficiary QR' },
              { icon: 'nfc', label: 'Tap NFC Card',  sub: 'Hold card near device to charge' },
            ].map(({ icon, label, sub }) => (
              <TouchableOpacity key={label} style={styles.altMethod} activeOpacity={0.75}>
                <View style={styles.altIcon}>
                  <Icon name={icon} size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.altLabel}>{label}</Text>
                  <Text style={styles.altSub}>{sub}</Text>
                </View>
                <Icon name="chevron-right" size={15} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  scrollPad: { padding: 20, paddingBottom: 40 },

  // Input step
  fieldLabel: {
    fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  dialCode: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 12,
    borderRightWidth: 1, borderRightColor: '#F3F4F6',
    backgroundColor: Colors.bg,
  },
  flag: { fontSize: 16 },
  dialText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '600', color: Colors.textBody },
  phoneInput: {
    flex: 1, height: 48, paddingHorizontal: 14,
    fontFamily: 'Roboto', fontSize: 15, color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  altMethod: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.card, paddingHorizontal: 16, paddingVertical: 14,
    ...Shadows.card,
  },
  altIcon: {
    width: 40, height: 40, borderRadius: Radius.card,
    backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center',
  },
  altLabel: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 13, color: Colors.textPrimary, marginBottom: 2 },
  altSub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted },

  // Confirm step
  confirmCard: {
    backgroundColor: Colors.bg, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', padding: 16,
  },
  confirmProfile: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 14,
  },
  confirmName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary },
  confirmPhone: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  confirmKey: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textSecondary },
  confirmVal: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  // OTP step
  shieldIcon: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  otpTitle: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 18, color: Colors.textPrimary, marginBottom: 8 },
  otpSub: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 28 },
  otpRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  otpBox: {
    flex: 1, height: 46, textAlign: 'center',
    fontFamily: 'Manrope', fontWeight: '800', fontSize: 18, color: Colors.textPrimary,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.input,
    backgroundColor: Colors.bg,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  otpBoxError: { borderColor: '#FCA5A5' },
  otpError: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginBottom: 8 },
  progressTrack: {
    height: 2, backgroundColor: '#F3F4F6', borderRadius: 100, marginBottom: 28, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 100,
  },
  verifyingRow: {
    height: 48, backgroundColor: Colors.bg, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  verifyingText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textSecondary },
  resendRow: {
    textAlign: 'center', marginTop: 20,
    fontFamily: 'Manrope', fontSize: 13, color: Colors.textMuted,
  },
  resendLink: { color: Colors.primary, fontWeight: '700' },

  // Success step
  amountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bg, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16,
  },
  amountLabel: { fontFamily: 'Manrope', fontSize: 14, color: Colors.textMuted },
  amountValue: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 22, color: Colors.textPrimary },
  detailCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
    overflow: 'hidden', marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  checkIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center',
  },
  detailTitle: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  detailDate: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted, marginBottom: 3 },
  receivedLabel: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '700', color: Colors.success },
  detailGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 16,
  },
  detailCell: { width: '45%' },
  detailKey: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textMuted, marginBottom: 3 },
  detailVal: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  // Shared
  footer: {
    padding: 20, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8,
  },
});
