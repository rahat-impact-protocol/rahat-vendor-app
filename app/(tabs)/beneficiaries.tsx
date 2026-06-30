import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ── Design tokens ─────────────────────────────────────────────
const HERO = '#1A56DB';
const HERO_DARK = '#1344B8';
const BG = '#F0F4FA';
const SURFACE = '#FFFFFF';
const TEXT_PRI = '#111827';
const TEXT_SEC = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';
const PURPLE = '#7C3AED';
const PURPLE_BG = '#F5F3FF';
const SUCCESS = '#22C55E';

// ── Mock data ─────────────────────────────────────────────────
const BENEFICIARIES = [
  { id: '1', name: 'Sita Sharma', phone: '+977 98010 12345', isOnline: true },
  { id: '2', name: 'Ram Bahadur', phone: '+977 98410 54321', isOnline: true },
  { id: '3', name: 'Puja Adhikari', phone: '+977 98210 98765', isOnline: true },
  { id: '4', name: 'Bikash Thapa', phone: '+977 97410 11223', isOnline: false },
  { id: '5', name: 'Anita Gurung', phone: '+977 98010 44556', isOnline: false },
  {
    id: '6',
    name: 'Krishna Tamang',
    phone: '+977 98510 77889',
    isOnline: false,
  },
];

const TABS = [
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
];

// ── BeneficiaryRow ─────────────────────────────────────────────
// function BeneficiaryRow({ item }) {
//   const initials = item.name
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .slice(0, 2);
//   // const tagStyle = TAG_STYLES[item.tag] || { bg: "#F3F4F6", color: "#374151" };

//   return (
//     <TouchableOpacity style={rowStyles.card} activeOpacity={0.75}>
//       {/* Avatar */}
//       <View style={rowStyles.avatar}>
//         <Text style={rowStyles.avatarText}>{initials}</Text>
//         <View
//           style={[
//             rowStyles.statusDot,
//             { backgroundColor: item.isOnline ? SUCCESS : '#D1D5DB' },
//           ]}
//         />
//       </View>

//       {/* Info */}
//       <View style={rowStyles.info}>
//         <Text style={rowStyles.name}>{item.name}</Text>
//         <Text style={rowStyles.phone}>{item.phone}</Text>
//       </View>

//       {/* Tag + chevron */}
//       <View style={rowStyles.right}>
//         {/* <View style={[rowStyles.tag, { backgroundColor: tagStyle.bg }]}>
//           <Text style={[rowStyles.tagText, { color: tagStyle.color }]}>
//             {item.tag}
//           </Text>
//         </View> */}
//         <Text style={rowStyles.chevron}>›</Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 15,
    color: HERO,
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: SURFACE,
  },
  info: { flex: 1 },
  name: {
    fontWeight: '700',
    fontSize: 14,
    color: TEXT_PRI,
    marginBottom: 3,
  },
  phone: {
    fontSize: 12,
    color: TEXT_SEC,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
});

// ── FindBeneficiaryScreen ──────────────────────────────────────
export default function BeneficiariesScreen() {
  const [activeTab, setActiveTab] = React.useState('online');
  const [search, setSearch] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const online = BENEFICIARIES.filter((b) => b.isOnline);
  const offline = BENEFICIARIES.filter((b) => !b.isOnline);
  const base = activeTab === 'online' ? online : offline;
  const shown = search.trim()
    ? base.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : base;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={HERO} />

      {/* ── Blue Hero ── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heroTitle}>Beneficiaries</Text>
            <Text style={styles.heroSub}>All registered beneficiaries</Text>
          </View>
          {/* <View style={styles.pillOnline}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>{online.length} online</Text>
          </View> */}
        </View>

        {/* Tabs */}
        {/* <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const count = tab.id === 'online' ? online.length : offline.length;
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[styles.tabBadge, isActive && styles.tabBadgeActive]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isActive && styles.tabBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View> */}

        {/* ── Inverted curve: white notch that curves UP into the hero ── */}
        <View style={styles.curveNotch} />
      </View>

      {/* ── Content (sits on top of the curve) ── */}
      <View style={styles.content}>
        {/* Search */}
        <View
          style={[
            styles.searchWrap,
            focused && styles.rowFocused,
            { outlineStyle: 'none' } as any,
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search beneficiary…"
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            onFocus={() => {
              setFocused(true); // ← add
              if (open) setOpen(false);
            }}
            onBlur={() => setFocused(false)}
          />
        </View>

        {/* List */}
        <View style={{ flex: 1, marginBottom: 32 }}>
          <Text style={{ color: TEXT_MUTED, marginBottom: 12 }}>
            Coming soon: list of beneficiaries will appear here.
          </Text>
        </View>
        {/* <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BeneficiaryRow item={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No beneficiaries found.</Text>
          }
        /> */}
      </View>
    </SafeAreaView>
  );
}

const CURVE_H = 28;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // ── Hero ──────────────────────────────────────────────────────
  hero: {
    backgroundColor: HERO,
    paddingHorizontal: 20,
    paddingTop: 16,
    // No bottom padding — curve notch provides clearance
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  rowFocused: {
    borderColor: '#1A56DB',
    shadowColor: '#1A56DB',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  circle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute',
    right: 60,
    top: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  circle3: {
    position: 'absolute',
    left: -30,
    bottom: 30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  stepPct: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 3,
  },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  pillOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: SUCCESS },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // ── Tabs ──────────────────────────────────────────────────────
  tabsRow: { flexDirection: 'row' },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#fff' },
  tabLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabBadgeActive: { backgroundColor: '#fff' },
  tabBadgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: { color: HERO, fontSize: 11, fontWeight: '700' },

  // ── Inverted curve notch ──────────────────────────────────────
  // A white rounded-top rectangle that sits at the bottom of the hero,
  // "cutting" upward into it — creating the appearance that the content
  // area curves up into the blue header.
  curveNotch: {
    height: CURVE_H,
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 0,
    // pull left/right edge-to-edge
    marginHorizontal: -20,
  },

  // ── Content area ──────────────────────────────────────────────
  content: {
    flex: 1,
    marginTop: -CURVE_H, // overlap behind the hero's curve notch
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: CURVE_H + 4,
    paddingHorizontal: 16,
    zIndex: 5,
  },

  // ── Search ────────────────────────────────────────────────────
  // searchWrap: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: SURFACE,
  //   borderRadius: 14,
  //   borderWidth: 1,
  //   borderColor: BORDER,
  //   paddingHorizontal: 14,
  //   paddingVertical: 10,
  //   marginBottom: 16,
  //   gap: 8,
  // },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1.5, // a touch heavier so focus ring reads clearly
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 4, // input now carries its own vertical padding
    marginBottom: 16,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  // searchInput: { flex: 1, fontSize: 14, color: TEXT_PRI },
  // searchInput: {
  //   flex: 1,
  //   backgroundColor: 'transparent',
  //   borderColor: '#E5E7EB',
  //   borderRadius: 9,
  //   paddingHorizontal: 14,
  //   paddingVertical: 13,
  //   fontFamily: 'Manrope',
  //   borderWidth: 1,
  //   fontSize: 14,
  //   color: '#111827',
  // },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0, // border now lives on searchWrap only
    paddingHorizontal: 0,
    paddingVertical: 10,
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#111827',
  },
  // ── List ──────────────────────────────────────────────────────
  listContent: { paddingBottom: 32 },
  empty: {
    textAlign: 'center',
    color: TEXT_MUTED,
    marginTop: 40,
    fontSize: 14,
  },
});
