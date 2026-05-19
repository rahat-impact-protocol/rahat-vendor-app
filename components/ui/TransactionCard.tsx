import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Colors, Shadows, Radius } from '@/constants/tokens';
import type { Transaction } from '@/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const { amount, hash, date, mode, status } = transaction;

  const isCompleted = status === 'completed';
  const iconBg = isCompleted ? '#DCFCE7' : '#FFF3E0';
  const iconColor = isCompleted ? '#16A34A' : '#E06714';

  const modeLabel = mode === 'online' ? 'Online' : 'Offline';
  const modeIcon = mode === 'online' ? 'wifi' : 'wifi-off';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Icon name="arrow-up-right" size={16} color={iconColor} strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.amount}>{amount}</Text>
          <Badge
            label={isCompleted ? 'COMPLETED' : 'PENDING'}
            variant={status}
          />
        </View>
        <Text style={styles.hash}>{hash}</Text>
        <View style={styles.metaRow}>
          <Icon name={modeIcon} size={12} color={Colors.textMuted} strokeWidth={1.75} />
          <Text style={styles.meta}>{modeLabel} • {date}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.card,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  hash: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
