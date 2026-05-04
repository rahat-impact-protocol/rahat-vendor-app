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
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Icon name="arrow-lr" size={16} color="#9CA3AF" />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.amount}>{amount}</Text>
          <Badge
            label={status === 'completed' ? 'Completed' : 'Pending'}
            variant={status}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.hash}>{hash}</Text>
          <Text style={styles.mode}>{mode}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
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
    padding: '14px 16px' as any,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.card,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  hash: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textMuted,
  },
  mode: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textMuted,
  },
  date: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textMuted,
  },
});
