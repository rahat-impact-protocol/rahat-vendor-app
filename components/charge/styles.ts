import { StyleSheet } from "react-native";
import {
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_COLOR,
  ERROR_COLOR,
} from "./constants";

export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE },
  scrollPad: { padding: 20, paddingBottom: 36 },
  centeredContent: { alignItems: "center" as const },
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
    fontWeight: "800" as const,
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
    fontWeight: "700" as const,
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase" as const,
  },
  fieldError: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: ERROR_COLOR,
    marginTop: 6,
  },

  cancelBtn: { alignSelf: "center" as const, paddingVertical: 14 },
  cancelText: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500" as const,
  },

  stateIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FEE2E2",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 20,
    marginBottom: 20,
  },
  stateIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stateTitle: {
    fontFamily: "Manrope",
    fontWeight: "800" as const,
    fontSize: 22,
    color: TEXT_PRIMARY,
    textAlign: "center" as const,
    marginBottom: 12,
  },
  stateSub: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center" as const,
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  detailCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
