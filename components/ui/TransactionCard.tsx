import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "@/components/ui/Icon";
import type { Transaction } from "@/types";

const PRIMARY = "#1A56DB";
const CONFIRMED_BG = "#DCFCE7";
const CONFIRMED_TEXT = "#027A48";
const PENDING_BG = "#FFF3CD";
const PENDING_TEXT = "#B54708";
const TEXT_PRI = "#111827";
const TEXT_MUTED = "#9CA3AF";
const BORDER = "#F3F4F6";
const SURFACE = "#FFFFFF";

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {
  const { amount, date, status, hash, actionType } = transaction;

  const isConfirmed = status?.toUpperCase() === "CONFIRMED";
  const avatarBg = isConfirmed ? "#EFF6FF" : "#FFF7ED";
  const avatarColor = isConfirmed ? PRIMARY : "#EA580C";

  const shortHash = hash ? `${hash.slice(0, 10)}…${hash.slice(-15)}` : "—";

  const formattedAction = actionType
    ? actionType
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Transaction";

  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        {/* Avatar spanning both rows */}
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Icon name="zap" size={14} color={avatarColor} strokeWidth={2} />
        </View>

        {/* Right content */}
        <View style={styles.content}>
          {/* Row 1: status badge | action type | amount */}
          <View style={styles.row}>
            <View style={styles.leftGroup}>
              <Text style={styles.actionType} numberOfLines={1}>
                {formattedAction}
              </Text>
              <View
                style={[
                  styles.badge,
                  isConfirmed ? styles.badgeConfirmed : styles.badgePending,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isConfirmed
                      ? styles.badgeTextConfirmed
                      : styles.badgeTextPending,
                  ]}
                >
                  {status ?? "UNKNOWN"}
                </Text>
              </View>
            </View>
            <Text style={styles.amount}>
              {amount} <Text style={styles.unit}>Tokens</Text>
            </Text>
          </View>

          {/* Row 2: hash | date */}
          <View style={styles.row}>
            <View style={styles.hashRow}>
              <Text style={styles.hash}>{shortHash}</Text>
            </View>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionType: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: TEXT_PRI,
    flexShrink: 1,
  },
  amount: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 15,
    color: TEXT_PRI,
    flexShrink: 0,
  },
  unit: {
    fontFamily: "Manrope",
    fontWeight: "400",
    fontSize: 12,
    color: TEXT_MUTED,
  },
  hashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 1,
  },
  hash: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 0.2,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeConfirmed: { backgroundColor: CONFIRMED_BG },
  badgePending: { backgroundColor: PENDING_BG },
  badgeText: {
    fontFamily: "Manrope",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  badgeTextConfirmed: { color: CONFIRMED_TEXT },
  badgeTextPending: { color: PENDING_TEXT },
  date: {
    fontFamily: "Manrope",
    fontSize: 9,
    color: TEXT_MUTED,
  },
});
