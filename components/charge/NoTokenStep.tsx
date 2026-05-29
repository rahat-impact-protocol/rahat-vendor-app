import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { BeneficiaryApiResponse } from "@/services";
import { shared } from "./styles";
import { InfoRow, infoRowStyles as ir } from "./InfoRow";
import { SecureFooter } from "./SecureFooter";

type Props = {
  beneficiary: BeneficiaryApiResponse | null;
  phone: string;
  resetFlow: () => void;
};

export const NoTokenStep: React.FC<Props> = ({ beneficiary, phone, resetFlow }) => (
  <View style={shared.whiteSheet}>
    <ScrollView
      contentContainerStyle={[shared.scrollPad, shared.centeredContent]}
      showsVerticalScrollIndicator={false}
    >
      <View style={shared.stateIconOuter}>
        <View style={[shared.stateIconInner, { backgroundColor: "#F59E0B" }]}>
          <Icon name="alert-circle" size={28} color="#fff" />
        </View>
      </View>
      <Text style={shared.stateTitle}>No Tokens Assigned</Text>
      <Text style={shared.stateSub}>
        This beneficiary has no tokens assigned in the current project. Please
        contact the project administrator.
      </Text>
      {beneficiary && (
        <View style={[shared.detailCard, { width: "100%", marginTop: 24 }]}>
          <InfoRow label="Name" value={beneficiary.name} />
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
);
