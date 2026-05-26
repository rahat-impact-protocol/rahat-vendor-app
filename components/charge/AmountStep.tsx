import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  PURPLE,
  PURPLE_LIGHT,
  PURPLE_MID,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  SURFACE,
  BG_LIGHT,
  ERROR_COLOR,
} from "./constants";
import { shared } from "./styles";
import { SecureFooter } from "./SecureFooter";

type Props = {
  amount: string;
  setAmount: (v: string) => void;
  amountError: string;
  setAmountError: (v: string) => void;
  availableTokens: number;
  loading: boolean;
  handleCreateClaim: () => void;
  onBack: () => void;
};

export const AmountStep: React.FC<Props> = ({
  amount,
  setAmount,
  amountError,
  setAmountError,
  availableTokens,
  loading,
  handleCreateClaim,
  onBack,
}) => (
  <View style={shared.whiteSheet}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={shared.scrollPad}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={shared.stepTitle}>Enter Redeem Amount</Text>

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

        <Text style={shared.fieldLabel}>REDEEM AMOUNT</Text>
        <View style={[s.amountRow, amountError ? s.amountRowError : null]}>
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
          <Text style={shared.fieldError}>{amountError}</Text>
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
                  style={[s.chipText, disabled ? s.chipTextDisabled : null]}
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
        <TouchableOpacity onPress={onBack} style={shared.cancelBtn}>
          <Text style={shared.cancelText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    <SecureFooter />
  </View>
);

const s = StyleSheet.create({
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
});
