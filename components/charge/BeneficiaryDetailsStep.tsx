import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { BeneficiaryApiResponse } from "@/services";
import {
  PURPLE,
  PURPLE_LIGHT,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SURFACE,
  BG_LIGHT,
  SUCCESS_COLOR,
  ERROR_COLOR,
} from "./constants";
import { shared } from "./styles";
import { InfoRow, infoRowStyles as ir } from "./InfoRow";
import { SecureFooter } from "./SecureFooter";

type ActiveProject = { name: string } | null | undefined;

type Props = {
  beneficiary: BeneficiaryApiResponse;
  phone: string;
  activeProject: ActiveProject;
  availableTokens: number;
  handleProceedFromDetails: () => void;
  resetFlow: () => void;
};

export const BeneficiaryDetailsStep: React.FC<Props> = ({
  beneficiary,
  phone,
  activeProject,
  availableTokens,
  handleProceedFromDetails,
  resetFlow,
}) => (
  <View style={shared.whiteSheet}>
    <ScrollView
      contentContainerStyle={shared.scrollPad}
      showsVerticalScrollIndicator={false}
    >
      <Text style={shared.stepTitle}>Beneficiary Found</Text>
      <Text style={shared.stepSub}>
        Confirm the beneficiary details before proceeding.
      </Text>

      <View style={s.benCard}>
        <View style={s.benAvatar}>
          <Text style={s.benAvatarText}>
            {(beneficiary.name ?? "?")[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.benName}>{beneficiary.name}</Text>
          <Text style={s.benPhone}>+977 {phone}</Text>
        </View>
        <View style={s.benOnlineBadge}>
          <Text style={s.benOnlineText}>Online</Text>
        </View>
      </View>

      <View style={shared.detailCard}>
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
              { color: availableTokens > 0 ? SUCCESS_COLOR : ERROR_COLOR },
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
        label={availableTokens > 0 ? "Proceed to Redeem" : "No Tokens Available"}
        icon={availableTokens > 0 ? "zap" : "alert-circle"}
        onPress={handleProceedFromDetails}
      />
      <TouchableOpacity onPress={resetFlow} style={shared.cancelBtn}>
        <Text style={shared.cancelText}>← Search Again</Text>
      </TouchableOpacity>
      <SecureFooter />
    </ScrollView>
  </View>
);

const s = StyleSheet.create({
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
});
