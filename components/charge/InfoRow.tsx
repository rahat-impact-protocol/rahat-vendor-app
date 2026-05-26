import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BORDER_COLOR, TEXT_MUTED, TEXT_PRIMARY } from "./constants";

export const InfoRow: React.FC<{ label: string; value: string | undefined }> = ({
  label,
  value,
}) => (
  <View style={s.row}>
    <Text style={s.label}>{label}</Text>
    <Text style={s.value}>{value}</Text>
  </View>
);

export const infoRowStyles = StyleSheet.create({
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

const s = infoRowStyles;
