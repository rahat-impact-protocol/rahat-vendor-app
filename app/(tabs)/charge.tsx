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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore, useProjectStore } from "@/stores";
import { chargeService } from "@/services";
import type { BeneficiaryApiResponse } from "@/services";
import { getBeneficiaryOnChainBalance } from "@/utils/contractBalance";

// ── Schema ──────────────────────────────────────────────────────
const phoneSchema = z
  .string()
  .min(7, "Phone number must be at least 7 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\d+$/, "Phone number must contain digits only");

// ── Step definition ──────────────────────────────────────────────
type Step =
  | "phone-input"
  | "beneficiary-details"
  | "no-beneficiary"
  | "no-token"
  | "amount";

// ── Colours ──────────────────────────────────────────────────────
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

// ── Header ────────────────────────────────────────────────────────
const STEP_NUMBERS: Record<Step, number> = {
  "phone-input": 1,
  "no-beneficiary": 1,
  "beneficiary-details": 2,
  "no-token": 2,
  amount: 3,
};
const TOTAL_STEPS = 5;

const WizardHeader: React.FC<{ step: Step }> = ({ step }) => {
  const idx = STEP_NUMBERS[step];
  const pct = Math.round((idx / TOTAL_STEPS) * 100);
  const labels: Record<Step, string> = {
    "phone-input": "Find Beneficiary",
    "no-beneficiary": "Find Beneficiary",
    "beneficiary-details": "Beneficiary Details",
    "no-token": "No Tokens",
    amount: "Enter Amount",
  };
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
          Step {idx} of {TOTAL_STEPS} — {labels[step]}
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

// ── Secure Footer ─────────────────────────────────────────────────
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
  },
  text: {
    fontFamily: "Manrope",
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});

// ── Info Row helper ───────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={ir.row}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value}>{value}</Text>
  </View>
);
const ir = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  label: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  value: {
    fontFamily: "Manrope",
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
});

// ────────────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────────────
export default function ChargeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Store access
  const vendor = useAuthStore((s) => s.vendor);
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeProject = useProjectStore((s) => s.activeProject);

  // ── State ──────────────────────────────────────────────────
  const [step, setStep] = React.useState<Step>("phone-input");
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [beneficiary, setBeneficiary] =
    React.useState<BeneficiaryApiResponse | null>(null);
  const [availableTokens, setAvailableTokens] = React.useState(0);

  const [amount, setAmount] = React.useState("");
  const [amountError, setAmountError] = React.useState("");

  // ── Helpers ───────────────────────────────────────────────
  const projectBaseUrl = activeProject?.baseUrl ?? "";
  const token = accessToken ?? "";
  const vendorId = vendor?.id ?? "";

  const validatePhone = (val: string): boolean => {
    const result = phoneSchema.safeParse(val);
    if (!result.success) {
      setPhoneError("Phone number must be 7–15 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const resetFlow = () => {
    setStep("phone-input");
    setPhone("");
    setPhoneError("");
    setBeneficiary(null);
    setAvailableTokens(0);
    setAmount("");
    setAmountError("");
  };

  // ── Step 1: Find Beneficiary ──────────────────────────────
  const handleFindBeneficiary = async () => {
    if (!validatePhone(phone)) return;
    if (!projectBaseUrl) {
      Alert.alert("No Active Project", "Please select a project first.");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      const ben = await chargeService.getBeneficiaryByPhone(
        projectBaseUrl,
        phone,
        token,
      );
      setBeneficiary(ben);

      // Fetch on-chain balance from FundStorage contract
      let tokens = 0;
      try {
        const walletAddress = ben.beneficiary?.walletAddress;
        console.log("Beneficiary wallet address:", walletAddress);
        if (walletAddress) {
          tokens = await getBeneficiaryOnChainBalance(walletAddress);
        }
      } catch (contractErr: any) {
        // Log the real error so we can diagnose contract call failures
        console.error('Contract balance fetch failed:', contractErr?.message ?? contractErr);
        tokens = 0;
      }

      console.log("Available tokens for beneficiary:", tokens);
      setAvailableTokens(tokens);
      setStep("beneficiary-details");
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        setStep("no-beneficiary");
      } else {
        Alert.alert("Error", err?.message ?? "Failed to find beneficiary.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Check balance → proceed or no-token ───────────
  const handleProceedFromDetails = () => {
    if (availableTokens <= 0) {
      setStep("no-token");
    } else {
      setStep("amount");
    }
  };

  // ── Step 3: Create Claim ──────────────────────────────────
  const handleCreateClaim = async () => {
    const numAmount = parseInt(amount, 10);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Enter a valid amount");
      return;
    }
    if (numAmount > availableTokens) {
      setAmountError(
        `Amount cannot exceed available tokens (${availableTokens})`,
      );
      return;
    }
    if (!beneficiary?.beneficiary?.walletAddress) {
      Alert.alert("Error", "Beneficiary wallet address is missing.");
      return;
    }
    setAmountError("");
    setLoading(true);
    try {
      const claim = await chargeService.createClaim(
        projectBaseUrl,
        vendorId,
        {
          walletAddress: beneficiary.beneficiary.walletAddress,
          amount: numAmount,
        },
        token,
      );
      router.push({
        pathname: "/otp-verify",
        params: {
          claimId: claim.id ?? claim.uuid ?? claim.claimId ?? "",
          phone,
          amount,
          beneficiaryName: beneficiary.name ?? "",
          projectName: activeProject?.name ?? "",
        },
      });
    } catch (err: any) {
      Alert.alert("Claim Failed", err?.message ?? "Failed to create claim.");
    } finally {
      setLoading(false);
    }
  };

  // ── Mask helpers ──────────────────────────────────────────
  const maskName = (name?: string): string => {
    if (!name) return "—";
    return name
      .trim()
      .split(" ")
      .map((w) =>
        w.length <= 2
          ? w
          : `${w[0]}${"*".repeat(w.length - 2)}${w[w.length - 1]}`,
      )
      .join(" ");
  };

  // ════════════════════════════════════════════════════════
  // Render: AMOUNT
  // ════════════════════════════════════════════════════════
  if (step === "amount") {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="amount" />
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
              <Text style={s.stepTitle}>Enter Redeem Amount</Text>

              <View style={s.tokenBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={s.tokenBannerLabel}>AVAILABLE TOKENS</Text>
                  <Text style={s.tokenBannerValue}>
                    {availableTokens}{" "}
                    <Text style={s.tokenBannerUnit}>Tokens</Text>
                  </Text>
                </View>
                <View style={s.tokenBannerIcon}>
                  <Icon name="zap" size={22} color={PURPLE} />
                </View>
              </View>

              <Text style={s.fieldLabel}>REDEEM AMOUNT</Text>
              <View
                style={[s.amountRow, amountError ? s.amountRowError : null]}
              >
                <TextInput
                  value={amount}
                  onChangeText={(v) => {
                    setAmount(v.replace(/[^0-9]/g, ""));
                    setAmountError("");
                  }}
                  placeholder="Enter token amount"
                  keyboardType="number-pad"
                  style={s.amountInput}
                  placeholderTextColor={TEXT_MUTED}
                />
                <View style={s.amountUnit}>
                  <Text style={s.amountUnitText}>Tokens</Text>
                </View>
              </View>
              {amountError ? (
                <Text style={s.fieldError}>{amountError}</Text>
              ) : null}

              <View style={s.chipsRow}>
                {[100, 500, 1000, 5000].map((v) => {
                  const disabled = v > availableTokens;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[s.chip, disabled ? s.chipDisabled : null]}
                      onPress={() => {
                        if (!disabled) {
                          setAmount(String(v));
                          setAmountError("");
                        }
                      }}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          s.chipText,
                          disabled ? s.chipTextDisabled : null,
                        ]}
                      >
                        {v}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={s.chip}
                  onPress={() => {
                    setAmount(String(availableTokens));
                    setAmountError("");
                  }}
                >
                  <Text style={s.chipText}>Max</Text>
                </TouchableOpacity>
              </View>

              <Button
                label="Create Claim"
                icon="zap"
                onPress={handleCreateClaim}
                loading={loading}
              />
              <TouchableOpacity
                onPress={() => setStep("beneficiary-details")}
                style={s.cancelBtn}
              >
                <Text style={s.cancelText}>← Back</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
          <SecureFooter />
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: NO TOKEN
  // ════════════════════════════════════════════════════════
  if (step === "no-token") {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="no-token" />
        <View style={s.whiteSheet}>
          <ScrollView
            contentContainerStyle={[s.scrollPad, s.centeredContent]}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.stateIconOuter}>
              <View style={[s.stateIconInner, { backgroundColor: "#F59E0B" }]}>
                <Icon name="alert-circle" size={28} color="#fff" />
              </View>
            </View>
            <Text style={s.stateTitle}>No Tokens Assigned</Text>
            <Text style={s.stateSub}>
              This beneficiary has no tokens assigned in the current project.
              Please contact the project administrator.
            </Text>
            {beneficiary && (
              <View style={[s.detailCard, { width: "100%", marginTop: 24 }]}>
                <InfoRow label="Name" value={maskName(beneficiary.name)} />
                <InfoRow label="Phone" value={`+977 ${phone}`} />
                <View style={[ir.row, { borderBottomWidth: 0 }]}>
                  <Text style={ir.label}>Available</Text>
                  <Text style={[ir.value, { color: "#F59E0B" }]}>0 Tokens</Text>
                </View>
              </View>
            )}
            <View style={{ gap: 12, marginTop: 24, width: "100%" }}>
              <Button
                label="Try Another Number"
                icon="search"
                onPress={resetFlow}
              />
            </View>
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: BENEFICIARY DETAILS
  // ════════════════════════════════════════════════════════
  if (step === "beneficiary-details" && beneficiary) {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="beneficiary-details" />
        <View style={s.whiteSheet}>
          <ScrollView
            contentContainerStyle={s.scrollPad}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.stepTitle}>Beneficiary Found</Text>
            <Text style={s.stepSub}>
              Confirm the beneficiary details before proceeding.
            </Text>

            <View style={s.benCard}>
              <View style={s.benAvatar}>
                <Text style={s.benAvatarText}>
                  {(beneficiary.name ?? "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.benName}>{maskName(beneficiary.name)}</Text>
                <Text style={s.benPhone}>+977 {phone}</Text>
              </View>
              <View style={s.benOnlineBadge}>
                <Text style={s.benOnlineText}>Online</Text>
              </View>
            </View>

            <View style={s.detailCard}>
              <InfoRow
                label="Wallet"
                value={
                  beneficiary.beneficiary?.walletAddress
                    ? `${beneficiary.beneficiary.walletAddress.slice(0, 8)}...${beneficiary.beneficiary.walletAddress.slice(-6)}`
                    : "—"
                }
              />
              <InfoRow label="Project" value={activeProject?.name ?? "—"} />
              <View style={[ir.row, { borderBottomWidth: 0 }]}>
                <Text style={ir.label}>Token Balance</Text>
                <Text
                  style={[
                    ir.value,
                    {
                      color: availableTokens > 0 ? SUCCESS_COLOR : ERROR_COLOR,
                    },
                  ]}
                >
                  {availableTokens} Tokens
                </Text>
              </View>
            </View>

            {availableTokens > 0 ? (
              <View style={s.balanceGoodBanner}>
                <Icon name="check-circle" size={16} color={SUCCESS_COLOR} />
                <Text style={s.balanceGoodText}>
                  {availableTokens} tokens available for redemption
                </Text>
              </View>
            ) : (
              <View style={s.balanceBadBanner}>
                <Icon name="alert-circle" size={16} color="#F59E0B" />
                <Text style={s.balanceBadText}>
                  No tokens assigned to this beneficiary
                </Text>
              </View>
            )}

            <Button
              label={
                availableTokens > 0
                  ? "Proceed to Redeem"
                  : "No Tokens Available"
              }
              icon={availableTokens > 0 ? "zap" : "alert-circle"}
              onPress={handleProceedFromDetails}
            />
            <TouchableOpacity onPress={resetFlow} style={s.cancelBtn}>
              <Text style={s.cancelText}>← Search Again</Text>
            </TouchableOpacity>
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: NO BENEFICIARY
  // ════════════════════════════════════════════════════════
  if (step === "no-beneficiary") {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <WizardHeader step="no-beneficiary" />
        <View style={s.whiteSheet}>
          <ScrollView
            contentContainerStyle={[s.scrollPad, s.centeredContent]}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.stateIconOuter}>
              <View
                style={[s.stateIconInner, { backgroundColor: ERROR_COLOR }]}
              >
                <Icon name="user-x" size={28} color="#fff" />
              </View>
            </View>
            <Text style={s.stateTitle}>Beneficiary Not Found</Text>
            <Text style={s.stateSub}>
              No beneficiary was found with phone{" "}
              <Text style={{ fontWeight: "700" }}>+977 {phone}</Text> in this
              project. Please check the number and try again.
            </Text>
            <View style={{ gap: 12, marginTop: 24, width: "100%" }}>
              <Button label="Try Again" icon="search" onPress={resetFlow} />
            </View>
            <SecureFooter />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: PHONE INPUT (default / step 1)
  // ════════════════════════════════════════════════════════
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <WizardHeader step="phone-input" />
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
              Enter the beneficiary's phone number to look up their details and
              available token balance.
            </Text>

            <Text style={s.fieldLabel}>PHONE NUMBER</Text>
            <View style={[s.phoneRow, phoneError ? s.phoneRowError : null]}>
              <View style={s.dialCode}>
                <Text style={s.dialText}>+977</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={(v) => {
                  setPhone(v.replace(/[^0-9]/g, ""));
                  if (phoneError) validatePhone(v);
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={s.phoneInput}
                placeholderTextColor={TEXT_MUTED}
                returnKeyType="search"
                onSubmitEditing={handleFindBeneficiary}
              />
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={PRIMARY_BLUE}
                  style={{ paddingRight: 12 }}
                />
              ) : null}
            </View>
            {phoneError ? <Text style={s.fieldError}>{phoneError}</Text> : null}

            {activeProject ? (
              <View style={s.projectBadge}>
                <Icon name="briefcase" size={13} color={PRIMARY_BLUE} />
                <Text style={s.projectBadgeText}>{activeProject.name}</Text>
              </View>
            ) : (
              <View style={s.projectBadge}>
                <Icon name="alert-circle" size={13} color={ERROR_COLOR} />
                <Text style={[s.projectBadgeText, { color: ERROR_COLOR }]}>
                  No project selected
                </Text>
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Button
                label="Search Beneficiary"
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

// ── Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE },
  scrollPad: { padding: 20, paddingBottom: 36 },
  centeredContent: { alignItems: "center" },
  whiteSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingTop: 20,
  },

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

  fieldLabel: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  fieldError: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: ERROR_COLOR,
    marginTop: 6,
  },

  phoneRow: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: SURFACE,
    alignItems: "center",
  },
  phoneRowError: { borderColor: ERROR_COLOR },
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

  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  projectBadgeText: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER_COLOR },
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
  altSub: { fontFamily: "Manrope", fontSize: 12, color: TEXT_MUTED },

  // Beneficiary card
  benCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: BG_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 16,
    marginBottom: 16,
  },
  benAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PURPLE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  benAvatarText: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 20,
    color: PURPLE,
  },
  benName: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 15,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  benPhone: { fontFamily: "Manrope", fontSize: 12, color: TEXT_SECONDARY },
  benOnlineBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  benOnlineText: {
    fontFamily: "Manrope",
    fontSize: 11,
    fontWeight: "700",
    color: SUCCESS_COLOR,
  },

  detailCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  balanceGoodBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 12,
    marginBottom: 20,
  },
  balanceGoodText: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "600",
    color: SUCCESS_COLOR,
  },
  balanceBadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 12,
    marginBottom: 20,
  },
  balanceBadText: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },

  // Amount step
  amountRow: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: SURFACE,
    alignItems: "center",
  },
  amountRowError: { borderColor: ERROR_COLOR },
  amountInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontFamily: "Manrope",
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  amountUnit: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
    backgroundColor: BG_LIGHT,
  },
  amountUnitText: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },

  tokenBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE_MID,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9DCFF",
    padding: 16,
    marginBottom: 20,
  },
  tokenBannerLabel: {
    fontFamily: "Manrope",
    fontSize: 10,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tokenBannerValue: {
    fontFamily: "Manrope",
    fontSize: 24,
    fontWeight: "800",
    color: PURPLE,
  },
  tokenBannerUnit: {
    fontFamily: "Manrope",
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },
  tokenBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: "#C4B5FD",
  },
  chipDisabled: { backgroundColor: BG_LIGHT, borderColor: BORDER_COLOR },
  chipText: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "700",
    color: PURPLE,
  },
  chipTextDisabled: { color: TEXT_MUTED },

  // OTP
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

  // State (no-beneficiary / no-token)
  stateIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  stateIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 22,
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 12,
  },
  stateSub: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  // Success
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
  successIconInner: {
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

  cancelBtn: { alignSelf: "center", paddingVertical: 14 },
  cancelText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
});
