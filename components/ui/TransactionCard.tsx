import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Transaction } from '@/types';

const PRIMARY = '#1A56DB';
const SUCCESS_BG = '#DCFCE7';
const SUCCESS_TEXT = '#027A48';
const PENDING_BG = '#FFF3CD';
const PENDING_TEXT = '#B54708';
const TEXT_PRI = '#111827';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#F3F4F6';
const SURFACE = '#FFFFFF';

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const { amount, date, mode, status } = transaction;

  const isCompleted = status === 'completed';
  const avatarBg = isCompleted ? '#EFF6FF' : '#FFF7ED';
  const avatarColor = isCompleted ? PRIMARY : '#EA580C';
  const modeIcon = mode === 'online' ? 'wifi' : 'wifi-off';
  const modeLabel = mode === 'online' ? 'Online' : 'Offline';

  return (
    <View style={styles.card}>
      {/* Avatar icon */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Icon name="zap" size={18} color={avatarColor} strokeWidth={2} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.amount}>
          {amount}{' '}
          <Text style={styles.unit}>Tokens</Text>
        </Text>
        <View style={styles.metaRow}>
          <Icon name={modeIcon} size={11} color={TEXT_MUTED} strokeWidth={1.75} />
          <Text style={styles.meta}>{modeLabel} · {date}</Text>
        </View>
      </View>

      {/* Status badge */}
      <View style={[styles.badge, isCompleted ? styles.badgeDone : styles.badgePending]}>
        <Text style={[styles.badgeText, isCompleted ? styles.badgeTextDone : styles.badgeTextPending]}>
          {isCompleted ? 'Completed' : 'Pending'}
        </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  amount: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 15,
    color: TEXT_PRI,
  },
  unit: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeDone: { backgroundColor: SUCCESS_BG },
  badgePending: { backgroundColor: PENDING_BG },
  badgeText: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextDone: { color: SUCCESS_TEXT },
  badgeTextPending: { color: PENDING_TEXT },
});
