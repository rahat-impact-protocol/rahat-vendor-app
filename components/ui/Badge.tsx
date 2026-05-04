import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

type BadgeVariant = 'online' | 'offline' | 'completed' | 'pending' | 'approved' | 'rejected' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { color: string; background: string; border?: string }> = {
  online:    { color: Colors.primary,     background: Colors.primarySubtle },
  offline:   { color: Colors.textSecondary, background: '#F0F0F0' },
  completed: { color: Colors.success,     background: '#ECFDF5' },
  approved:  { color: Colors.success,     background: '#ECFDF5' },
  pending:   { color: '#B54708',          background: '#FFFAEB' },
  rejected:  { color: Colors.error,       background: '#FEF2F2' },
  default:   { color: Colors.textSecondary, background: '#F0F0F0' },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const vs = variantStyles[variant];
  return (
    <View style={[styles.container, { backgroundColor: vs.background }]}>
      <Text style={[styles.text, { color: vs.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
  },
});
