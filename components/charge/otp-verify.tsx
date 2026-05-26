import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore, useProjectStore } from "@/stores";
import { chargeService } from "@/services";

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
const SUCCESS_COLOR = "#059669";

// function maskName(name: string): string {
//   if (!name) return "—";
//   return name
//     .trim()
//     .split(" ")
//     .map((w) =>
//       w.length <= 2
//         ? w
//         : `${w[0]}${"*".repeat(w.length - 2)}${w[w.length - 1]}`,
//     )
//     .join(" ");
// }

export default function OtpVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { benAddress, vendorId, phone, amount, beneficiaryName, projectName } =
    useLocalSearchParams<{
      benAddress: string;
      vendorId: string;
      phone: string;
      amount: string;
      beneficiaryName: string;
      projectName: string;
    }>();

  console.log("OTP Verify Params:", {
    benAddress,
    vendorId,
    phone,
    amount,
    beneficiaryName,
    projectName,
  });
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeProject = useProjectStore((s) => s.activeProject);
  const projectBaseUrl = activeProject?.baseUrl ?? "";
  const token = accessToken ?? "";

  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [txHash, setTxHash] = React.useState<string | null>(null);

  const otpRefs = React.useRef<(TextInput | null)[]>([]);
  const filledOtp = otp.filter(Boolean).length;

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
    try {
      const result = await chargeService.verifyOtp(
        projectBaseUrl,
        vendorId,
        { benAddress, otp: otp.join("") },
        token,
      );
      setTxHash(result.txHash ?? "");
    } catch (err: any) {
      Alert.alert("OTP Failed", err?.message ?? "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (txHash !== null) {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <View style={s.headerCircle1} />
          <View style={s.headerCircle2} />
          <Text style={s.headerTitle}>Humanitarian Portal</Text>
          <Text style={s.headerStep}>Step 5 of 5 — Charge Successful</Text>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: "100%" }]} />
          </View>
        </View>

        <View style={s.sheet}>
          <ScrollView
            contentContainerStyle={s.pad}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.successOuter}>
              <View style={s.successInner}>
                <Icon name="check" size={28} color="#fff" strokeWidth={3} />
              </View>
            </View>
            <Text style={s.successTitle}>Charge Successful!</Text>
            <Text style={s.successSub}>
              Token redemption completed successfully.
            </Text>

            <View style={s.card}>
              <InfoRow label="Beneficiary" value={beneficiaryName ?? "—"} />
              <InfoRow label="Phone" value={`+977 ${phone}`} />
              <InfoRow label="Amount Charged" value={`${amount} Tokens`} />
              <InfoRow label="Project" value={projectName ?? "—"} />
              {txHash ? (
                <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.infoLabel}>TX Hash</Text>
                  <Text
                    style={[s.infoValue, { color: PRIMARY_BLUE, fontSize: 12 }]}
                  >
                    {txHash.length > 20
                      ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}`
                      : txHash}
                  </Text>
                </View>
              ) : null}
            </View>

            <Button
              label="Charge Another Beneficiary"
              icon="zap"
              onPress={() => router.replace("/(tabs)/charge")}
            />
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── OTP input screen ──────────────────────────────────────
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View style={s.headerCircle1} />
        <View style={s.headerCircle2} />
        <Text style={s.headerTitle}>Humanitarian Portal</Text>
        <Text style={s.headerStep}>Step 4 of 5 — Verify OTP</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: "80%" }]} />
        </View>
      </View>

      <View style={s.sheet}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={s.pad}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.title}>Verify OTP</Text>
            <Text style={s.sub}>
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
                    val ? s.otpBoxFilled : null,
                    otpError ? s.otpBoxError : null,
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

            <Button
              label="Verify & Complete Charge"
              icon="zap"
              onPress={handleVerify}
              loading={loading}
              disabled={filledOtp < 6}
            />
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/charge");
                }
              }}
              style={s.backBtn}
            >
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <SecureFooter />
      </View>
    </View>
  );
}

// ── Shared sub-components ─────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const SecureFooter: React.FC = () => (
  <View style={s.footerRow}>
    <Icon name="lock" size={12} color={TEXT_MUTED} />
    <Text style={s.footerText}>Encrypted &amp; Secure Verification</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE },

  header: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    height: 130,
    position: "relative",
    overflow: "hidden",
  },
  headerCircle1: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerCircle2: {
    position: "absolute",
    right: 55,
    top: 25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 18,
    color: "#fff",
    marginBottom: 14,
  },
  headerStep: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  progressBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 100,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 100,
  },

  sheet: {
    flex: 1,
    backgroundColor: SURFACE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingTop: 20,
  },
  pad: { padding: 20, paddingBottom: 36 },

  title: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 22,
    color: TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 4,
  },
  sub: {
    fontFamily: "Manrope",
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 24,
  },

  otpRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  otpBox: {
    flex: 1,
    height: 52,
    width: 52,
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
  otpBoxFilled: { borderColor: PURPLE, backgroundColor: PURPLE_MID },
  otpBoxError: { borderColor: ERROR_COLOR },
  otpErrorText: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: ERROR_COLOR,
    marginBottom: 8,
  },
  resendBtn: { alignSelf: "center", paddingVertical: 8, marginBottom: 12 },
  resendLink: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: PURPLE,
    fontWeight: "700",
  },

  backBtn: { alignSelf: "center", paddingVertical: 14 },
  backText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },

  successOuter: {
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
  successInner: {
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
  successSub: {
    fontFamily: "Manrope",
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  infoLabel: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoValue: {
    fontFamily: "Manrope",
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    paddingVertical: 14,
  },
  footerText: {
    fontFamily: "Manrope",
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});
