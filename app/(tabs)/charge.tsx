import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Colors, Radius, Shadows } from "@/constants/tokens";
import { MOCK_BENEFICIARIES } from "@/mocks";
import type { Beneficiary } from "@/types";

// ── Zod schema ────────────────────────────────────────────────
const phoneSchema = z
  .string()
  .min(7, "Phone number must be at least 7 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\d+$/, "Phone number must contain digits only");

type Step = "input" | "confirm" | "otp" | "success";

const STEP_META: Record<Step, { index: number; label: string }> = {
  input: { index: 1, label: "Find Beneficiary" },
  confirm: { index: 2, label: "Confirm Details" },
  otp: { index: 3, label: "Verify OTP" },
  success: { index: 4, label: "Charge Successful" },
};
const TOTAL_STEPS = 4;

const PRIMARY_BLUE = "#1A56DB";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const PURPLE_MID = "#F5F0FF";
const BORDER_COLOR = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const SURFACE = "#FFFFFF";
const BG_LIGHT = "#F9FAFB";
const ERROR_COLOR = "#DC2626";
const DETAIL_BG = "#E8F1FA";
const DETAIL_BORDER = "#C8DDEF";

// ── Wizard Header ─────────────────────────────────────────────
const WizardHeader: React.FC<{ step: Step }> = ({ step }) => {
  const meta = STEP_META[step];
  const pct = Math.round((meta.index / TOTAL_STEPS) * 100);
  return (
    <View style={hdr.container}>
      <View style={hdr.hero}>
        <View style={hdr.circle1} />
        <View style={hdr.circle2} />
        <View style={hdr.circle3} />
      </View>
      <Text style={hdr.bannerTitle}>Humanitarian Portal</Text>
      <View style={hdr.track}>
        <Text style={hdr.stepText}>
          Step {meta.index} of {TOTAL_STEPS}
        </Text>
        <Text style={hdr.pctText}>{pct}%</Text>
      </View>
      <View style={hdr.barBg}>
        <View style={[hdr.barFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
};

const hdr = StyleSheet.create({
  hero: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 20,
    paddingTop: 6,
    position: "relative",
    overflow: "visible",
    zIndex: 10,
  },
  circle1: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circle2: {
    position: "absolute",
    right: 55,
    top: 25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  circle3: {
    position: "absolute",
    left: -30,
    bottom: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  container: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    height: 130,
    // marginBottom: 20,
  },
  bannerTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 18,
    color: "#fff",
    marginBottom: 14,
  },
  track: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stepText: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  pctText: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  barBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 100,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 100,
  },
});

// ── Secure Footer ─────────────────────────────────────────────
const SecureFooter: React.FC = () => (
  <View style={ft.row}>
    <Icon name="lock" size={12} color={TEXT_MUTED} />
    <Text style={ft.text}>Encrypted &amp; Secure Verification</Text>
  </View>
);

const ft = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    paddingVertical: 14,
    // borderTopWidth: 1,
    // borderTopColor: BORDER_COLOR,
  },
  text: {
    fontFamily: "Manrope",
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});

// ── Section Label ─────────────────────────────────────────────
const SectionLabel: React.FC<{ label: string; style?: object }> = ({
  label,
  style,
}) => <Text style={[sl.label, style]}>{label}</Text>;
const sl = StyleSheet.create({
  label: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
});

// ── Main Screen ───────────────────────────────────────────────
export default function ChargeScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = React.useState<Step>("input");
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [beneficiary, setBeneficiary] = React.useState<Beneficiary | null>(
    null,
  );
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [txHash] = React.useState("0x71c...3a4f");
  const otpRefs = React.useRef<(TextInput | null)[]>([]);

  const filledOtp = otp.filter(Boolean).length;

  // Validate phone with Zod
  const validatePhone = (val: string): boolean => {
    const result = phoneSchema.safeParse(val);
    if (!result.success) {
      setPhoneError("Phone number is required");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError) validatePhone(val);
  };

  const handleFindBeneficiary = async () => {
    if (!validatePhone(phone)) return;
    setLoading(true);
    Keyboard.dismiss();
    await new Promise((r) => setTimeout(r, 600));
    const b =
      MOCK_BENEFICIARIES.find((b) => b.isOnline) ?? MOCK_BENEFICIARIES[0];
    setBeneficiary({ ...b, phone });
    setLoading(false);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setStep("otp");
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
    if (key === "Backspace" && !otp[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    if (filledOtp < 6) {
      setOtpError(true);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("success");
  };

  const handleReset = () => {
    setStep("input");
    setPhone("");
    setPhoneError("");
    setBeneficiary(null);
    setOtp(["", "", "", "", "", ""]);
    setOtpError(false);
  };

  // ── Success ────────────────────────────────────────────────
  if (step === "success") {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="success" />
        <View style={s.whiteSheet}>
          <ScrollView
            contentContainerStyle={s.scrollPad}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Checkmark */}
            <View style={s.successIconOuter}>
              <View style={s.successIcon}>
                <Icon name="check" size={28} color="#fff" strokeWidth={3} />
              </View>
            </View>

            <Text style={s.successTitle}>Charge Successful</Text>
            <Text style={s.successTokens}>
              {beneficiary?.tokensApproved ?? 12}{" "}
              <Text style={s.successTokensUnit}>Tokens</Text>
            </Text>

            {/* Detail card */}
            <View style={s.detailCard}>
              <View style={s.detailRow}>
                <Text style={s.detailKey}>BENEFICIARY NAME</Text>
                <Text style={s.detailVal}>
                  {beneficiary?.maskedName ?? "A*****a L**********e"}
                </Text>
              </View>
              <View style={s.detailRowGroup}>
                <View style={s.detailHalf}>
                  <Text style={s.detailKey}>PHONE NUMBER</Text>
                  <Text style={s.detailVal}>+977 {phone}</Text>
                </View>
                <View style={[s.detailHalf, s.detailHalfBorder]}>
                  <Text style={s.detailKey}>PROJECT</Text>
                  <Text style={s.detailVal}>Winter Relief 2026</Text>
                </View>
              </View>
              <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={s.detailKey}>TRANSACTION HASH</Text>
                <View style={s.txRow}>
                  <Text style={s.detailVal}>{txHash}</Text>
                  <TouchableOpacity
                    onPress={() => Clipboard.setString(txHash)}
                    hitSlop={8}
                  >
                    <Icon name="copy" size={16} color={PRIMARY_BLUE} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ gap: 12, marginTop: 4 }}>
              <Button
                label="View in Blockchain Explorer"
                variant="outline"
                icon="external-link"
              />
              <TouchableOpacity onPress={handleReset} style={s.backHomeBtn}>
                <Icon name="home" size={14} color={TEXT_SECONDARY} />
                <Text style={s.backHomeText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── OTP ───────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="otp" />
        <View style={s.whiteSheet}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={s.scrollPad}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={s.stepTitle}>Verify OTP</Text>
              <Text style={s.stepSub}>
                Ask the beneficiary to share the OTP sent to their phone.
              </Text>

              <View style={s.otpRow}>
                {otp.map((val, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={val}
                    onChangeText={(v) => handleOtpChange(i, v)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleOtpKeyPress(i, key)
                    }
                    maxLength={1}
                    keyboardType="number-pad"
                    style={[
                      s.otpBox,
                      val && s.otpBoxFilled,
                      otpError && s.otpBoxError,
                    ]}
                    textAlign="center"
                  />
                ))}
              </View>

              {otpError && (
                <Text style={s.otpErrorText}>Please enter all 6 digits</Text>
              )}

              <TouchableOpacity style={s.resendBtn}>
                <Text style={s.resendLink}>Resend code</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 12 }}>
                <Button
                  label="Verify & Complete Charge"
                  icon="zap"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={filledOtp < 6}
                />
              </View>

              <TouchableOpacity
                onPress={() => setStep("confirm")}
                style={s.cancelBtn}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
          <SecureFooter />
        </View>
      </View>
    );
  }

  // ── Confirm ───────────────────────────────────────────────
  if (step === "confirm" && beneficiary) {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="confirm" />
        <View style={s.whiteSheet}>
          <ScrollView
            contentContainerStyle={s.scrollPad}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.stepTitle}>Confirm Details</Text>

            <SectionLabel label="Beneficiary Information" />
            <View style={s.beneCard}>
              <View style={s.beneNameSection}>
                <Text style={s.beneKey}>NAME</Text>
                <Text style={s.beneName}>{beneficiary.maskedName}</Text>
              </View>
              <View style={[s.beneRow, s.beneBorderTop]}>
                <View style={s.beneHalf}>
                  <Text style={s.beneKey}>PHONE</Text>
                  <Text style={s.beneVal}>+977 {phone}</Text>
                </View>
                <View style={s.beneHalf}>
                  <Text style={s.beneKey}>PROJECT</Text>
                  <Text style={s.beneVal}>Winter Relief 2026</Text>
                </View>
              </View>
            </View>

            <SectionLabel label="Token Allocation" style={{ marginTop: 20 }} />
            <View style={s.tokenCard}>
              <View style={s.tokenHalf}>
                <Text style={s.tokenLabel}>AVAILABLE</Text>
                <Text style={s.tokenAvail}>
                  {beneficiary.tokensAvailable}{" "}
                  <Text style={s.tokenUnit}>Tokens</Text>
                </Text>
              </View>
              <View style={[s.tokenHalf, s.tokenApprovedSide]}>
                <Text style={s.tokenLabelApproved}>APPROVED</Text>
                <Text style={s.tokenApproved}>
                  {beneficiary.tokensApproved}{" "}
                  <Text style={s.tokenApprovedUnit}>Tokens</Text>
                </Text>
              </View>
            </View>

            <View style={s.confirmFooter}>
              <Button
                label="Confirm & Charge"
                icon="zap"
                onPress={handleConfirm}
                loading={loading}
              />
              <TouchableOpacity
                onPress={() => setStep("input")}
                style={s.cancelBtn}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── Input (default) ───────────────────────────────────────
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <WizardHeader step="input" />
      <View style={s.whiteSheet}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scrollPad}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.stepTitle}>Find Beneficiary</Text>
            <Text style={s.stepSub}>
              Enter contact information or use biometric alternatives to
              identify the beneficiary.
            </Text>

            <Text style={s.fieldLabel}>PHONE NUMBER</Text>
            <View style={[s.phoneRow, phoneError ? s.phoneRowError : null]}>
              <View style={s.dialCode}>
                <Text style={s.dialText}>+977</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={s.phoneInput}
                placeholderTextColor={TEXT_MUTED}
              />
            </View>
            {phoneError ? (
              <Text style={s.phoneErrorText}>{phoneError}</Text>
            ) : null}

            <View style={{ marginTop: 20 }}>
              <Button
                label="Find Beneficiary"
                onPress={handleFindBeneficiary}
                loading={loading}
                icon="search"
              />
            </View>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={{ gap: 12 }}>
              {[
                {
                  icon: "qr",
                  label: "Scan QR Code",
                  sub: "Scan beneficiary ID card",
                },
                {
                  icon: "nfc",
                  label: "Tap NFC Card",
                  sub: "Contactless ID verification",
                },
              ].map(({ icon, label, sub }) => (
                <TouchableOpacity
                  key={label}
                  style={s.altMethod}
                  activeOpacity={0.75}
                >
                  <View style={s.altIcon}>
                    <Icon name={icon} size={20} color={PURPLE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.altLabel}>{label}</Text>
                    <Text style={s.altSub}>{sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <SecureFooter />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  scrollPad: {
    padding: 20,
    paddingBottom: 32,
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30, // ← only these two corners are rounded
    borderTopRightRadius: 30,
    marginTop: -24, // pull up over the hero image
    paddingTop: 20,
  },

  // Step title / sub
  stepTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 22,
    color: TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 4,
  },
  stepSub: {
    fontFamily: "Manrope",
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 24,
  },

  // ── Input step ──────────────────────────────────────────────
  fieldLabel: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: SURFACE,
  },
  phoneRowError: {
    borderColor: ERROR_COLOR,
  },
  dialCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    backgroundColor: BG_LIGHT,
  },
  dialText: {
    fontFamily: "Manrope",
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontFamily: "Manrope",
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  phoneErrorText: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: ERROR_COLOR,
    marginTop: 6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_COLOR,
  },
  dividerText: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  altMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  altIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  altLabel: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  altSub: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // ── Confirm step ────────────────────────────────────────────
  beneCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 4,
  },
  beneNameSection: { padding: 16 },
  beneBorderTop: { borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  beneName: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 15,
    color: TEXT_PRIMARY,
    marginTop: 4,
  },
  beneRow: { flexDirection: "row", padding: 16 },
  beneHalf: { flex: 1 },
  beneKey: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  beneVal: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },

  tokenCard: {
    flexDirection: "row",
    backgroundColor: PURPLE_MID,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9DCFF",
    overflow: "hidden",
  },
  tokenHalf: { flex: 1, padding: 16 },
  tokenApprovedSide: { borderLeftWidth: 1, borderLeftColor: "#E9DCFF" },
  tokenLabel: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tokenLabelApproved: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: PURPLE,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tokenAvail: {
    fontFamily: "Manrope",
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  tokenUnit: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },
  tokenApproved: {
    fontFamily: "Manrope",
    fontSize: 20,
    fontWeight: "800",
    color: PURPLE,
  },
  tokenApprovedUnit: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "500",
    color: PURPLE,
  },

  confirmFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },

  // ── OTP step ────────────────────────────────────────────────
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  otpBox: {
    flex: 1,
    width: 40,
    height: 52,
    textAlign: "center",
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 20,
    color: TEXT_PRIMARY,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    backgroundColor: "#FAF8FF",
  },
  otpBoxFilled: {
    borderColor: PURPLE,
    backgroundColor: PURPLE_MID,
  },
  otpBoxError: {
    borderColor: ERROR_COLOR,
  },
  otpErrorText: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: ERROR_COLOR,
    marginBottom: 8,
  },
  resendBtn: { alignSelf: "center", paddingVertical: 8, marginBottom: 8 },
  resendLink: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: PURPLE,
    fontWeight: "700",
  },
  cancelBtn: { alignSelf: "center", paddingVertical: 12 },
  cancelText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },

  // ── Success step ────────────────────────────────────────────
  successIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PURPLE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -10,
    marginBottom: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 22,
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 6,
  },
  successTokens: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 20,
    color: PURPLE,
    textAlign: "center",
    marginBottom: 28,
  },
  successTokensUnit: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 16,
    color: PURPLE,
  },

  detailCard: {
    backgroundColor: DETAIL_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DETAIL_BORDER,
    marginBottom: 20,
    overflow: "hidden",
  },
  detailRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: DETAIL_BORDER,
  },
  detailRowGroup: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: DETAIL_BORDER,
  },
  detailHalf: { flex: 1, padding: 14 },
  detailHalfBorder: { borderLeftWidth: 1, borderLeftColor: DETAIL_BORDER },
  detailKey: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailVal: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  txRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },

  backHomeBtn: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: 10,
    gap: 6,
    alignItems: "center",
  },
  backHomeText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
});
