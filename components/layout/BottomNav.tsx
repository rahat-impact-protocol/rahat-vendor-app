import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Colors, Shadows } from '@/constants/tokens';

const TABS = [
  { id: 'home',          href: '/(tabs)',                icon: 'home',     label: 'Home' },
  { id: 'charge',        href: '/(tabs)/charge',         icon: 'qr',       label: 'Charge' },
  { id: 'beneficiaries', href: '/(tabs)/beneficiaries',  icon: 'users',    label: 'People' },
  { id: 'settings',      href: '/(tabs)/settings',       icon: 'settings', label: 'Settings' },
] as const;

export const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 6),
          ...Shadows.nav,
        },
      ]}
    >
      {TABS.map(tab => {
        const isActive =
          tab.id === 'home'
            ? pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index'
            : pathname.startsWith(tab.href);
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => router.push(tab.href as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? Colors.primary : '#9CA3AF'}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: 2,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  labelActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
