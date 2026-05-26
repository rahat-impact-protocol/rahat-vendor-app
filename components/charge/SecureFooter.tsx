import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { TEXT_MUTED } from "./constants";

export const SecureFooter: React.FC = () => (
  <View style={s.row}>
    <Icon name="lock" size={12} color={TEXT_MUTED} />
    <Text style={s.text}>Encrypted &amp; Secure Verification</Text>
  </View>
);

const s = StyleSheet.create({
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
