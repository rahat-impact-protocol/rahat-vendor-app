import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  type Step,
  STEP_NUMBERS,
  TOTAL_STEPS,
  PRIMARY_BLUE,
} from "./constants";

export const WizardHeader: React.FC<{ step: Step }> = ({ step }) => {
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
    <View style={s.container}>
      <View style={s.hero}>
        <View style={s.circle1} />
        <View style={s.circle2} />
        <View style={s.circle3} />
      </View>
      <Text style={s.bannerTitle}>Humanitarian Portal</Text>
      <View style={s.track}>
        <Text style={s.stepText}>
          Step {idx} of {TOTAL_STEPS} — {labels[step]}
        </Text>
        <Text style={s.pctText}>{pct}%</Text>
      </View>
      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
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
