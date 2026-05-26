import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(7, "Phone number must be at least 7 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\d+$/, "Phone number must contain digits only");

export type Step =
  | "phone-input"
  | "beneficiary-details"
  | "no-beneficiary"
  | "no-token"
  | "amount";

export const PRIMARY_BLUE = "#1A56DB";
export const PURPLE = "#7C3AED";
export const PURPLE_LIGHT = "#EDE9FE";
export const PURPLE_MID = "#F5F0FF";
export const BORDER_COLOR = "#E5E7EB";
export const TEXT_PRIMARY = "#111827";
export const TEXT_SECONDARY = "#6B7280";
export const TEXT_MUTED = "#9CA3AF";
export const SURFACE = "#FFFFFF";
export const BG_LIGHT = "#F9FAFB";
export const ERROR_COLOR = "#DC2626";
export const SUCCESS_COLOR = "#059669";

export const STEP_NUMBERS: Record<Step, number> = {
  "phone-input": 1,
  "no-beneficiary": 1,
  "beneficiary-details": 2,
  "no-token": 2,
  amount: 3,
};
export const TOTAL_STEPS = 5;
