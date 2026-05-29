import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ERROR_COLOR } from "./constants";
import { shared } from "./styles";
import { SecureFooter } from "./SecureFooter";

type Props = {
  phone: string;
  resetFlow: () => void;
};

export const NoBeneficiaryStep: React.FC<Props> = ({ phone, resetFlow }) => (
  <View style={shared.whiteSheet}>
    <ScrollView
      contentContainerStyle={[shared.scrollPad, shared.centeredContent]}
      showsVerticalScrollIndicator={false}
    >
      <View style={shared.stateIconOuter}>
        <View style={[shared.stateIconInner, { backgroundColor: ERROR_COLOR }]}>
          <Icon name="user-x" size={28} color="#fff" />
        </View>
      </View>
      <Text style={shared.stateTitle}>Beneficiary Not Found</Text>
      <Text style={shared.stateSub}>
        No beneficiary was found with phone{" "}
        <Text style={{ fontWeight: "700" }}>+977 {phone}</Text> in this project.
        Please check the number and try again.
      </Text>
      <View style={{ gap: 12, marginTop: 24, width: "100%" }}>
        <Button label="Try Again" icon="search" onPress={resetFlow} />
      </View>
      <SecureFooter />
    </ScrollView>
  </View>
);
