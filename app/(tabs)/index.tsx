import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { Colors, Radius, Shadows } from "@/constants/tokens";
import { useAuthStore, useProjectStore, useOrgStore } from "@/stores";
import { MOCK_TRANSACTIONS } from "@/mocks";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vendor = useAuthStore((s) => s.vendor);
  const project = useProjectStore((s) => s.activeProject);
  const org = useOrgStore((s) => s.activeOrg);

  const recentTx = MOCK_TRANSACTIONS.slice(0, 3);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = vendor?.name?.split(" ")[0] ?? "Vendor";
  const lastName = vendor?.name?.split(" ")[1] ?? "";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.vendorName}>
                {firstName} {lastName}
              </Text>
            </View>
            <View style={styles.topRowRight}>
              <View style={styles.iconBtn}>
                <Icon name="bell" size={18} color="#fff" strokeWidth={1.75} />
                <View style={styles.bellDot} />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/settings")}
                style={styles.avatarBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarInitials}>
                  {vendor?.initials ?? "AL"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.breadcrumb}>
            <View style={styles.orgChip}>
              <Text style={styles.orgInitials}>{org?.initials ?? "RF"}</Text>
            </View>
            <Text style={styles.orgName}>
              {org?.name ?? "Rahat Foundation"}
            </Text>
            <Text style={styles.breadcrumbSep}>{" › "}</Text>
            <Text style={styles.projectName}>
              {project?.name ?? "Winter Relief 2026"}
            </Text>
          </View>
          <Text style={styles.balanceLabel}>Rahat Balance</Text>
          <View style={styles.balanceRow}>
            {/* Wrap the text elements together so they stay on the left */}
            <View style={styles.balanceTextGroup}>
              <Text style={styles.balanceAmount}>
                {(project?.tokens ?? 1250).toLocaleString()}
              </Text>
              <Text style={styles.balanceUnit}> tokens</Text>
            </View>

            {/* <TouchableOpacity
              onPress={() => router.push("/settings/select-project")}
              style={styles.switchProjectBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.switchProjectText}>Switch Project</Text>
              <Icon
                name="chevron-right"
                size={13}
                color="#fff"
                strokeWidth={2.5}
              />
            </TouchableOpacity> */}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/charge")}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrap}>
                <Icon name="zap" size={22} color="#fff" strokeWidth={1.75} />
              </View>
              <Text style={styles.quickActionLabel}>Charge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/beneficiaries")}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrap}>
                <Icon name="users" size={22} color="#fff" strokeWidth={1.75} />
              </View>
              <Text style={styles.quickActionLabel}>People</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/transactions" as any)}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrap}>
                <Icon name="clock" size={22} color="#fff" strokeWidth={1.75} />
              </View>
              <Text style={styles.quickActionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}> */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => router.push("/transactions" as any)}
              style={styles.seeAllBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.txList}>
            {recentTx.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const HERO_COLOR = "#1A56DB";//7461D6";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F9FC" },//#1A56DB
  hero: {
    backgroundColor: HERO_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  heroCircle1: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroCircle2: {
    position: "absolute",
    right: 50,
    top: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  greeting: {
    fontFamily: "Manrope",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 2,
  },
  vendorName: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 18,
    color: "#fff",
  },
  topRowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: HERO_COLOR,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 13,
    color: "#fff",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 18,
  },
  orgChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  orgInitials: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 10,
    color: "#fff",
  },
  orgName: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  breadcrumbSep: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  projectName: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  balanceLabel: {
    fontFamily: "Manrope",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceAmount: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 44,
    color: "#fff",
    letterSpacing: -1,
    lineHeight: 48,
  },
  balanceTextGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  balanceUnit: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
    marginLeft: 4,
  },
  switchProjectBtn: {
    // alignSelf: 'flex-start',
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    //"rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 14,
    // marginBottom: 24,
  },
  switchProjectText: {
    fontFamily: "Manrope",
    fontSize: 13,
    fontWeight: "500",
    color: "#7E00D1",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: "Manrope",
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { padding: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 16,
    color: "#1F242A",
  },
  seeAllBtn: { paddingVertical: 2 },
  seeAllText: {
    fontFamily: "Manrope",
    fontSize: 13,
    color: HERO_COLOR,
    fontWeight: "600",
  },
  txList: { gap: 10 },
});
