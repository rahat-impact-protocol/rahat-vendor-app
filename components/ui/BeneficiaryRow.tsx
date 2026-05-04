import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Colors, Shadows, Radius } from '@/constants/tokens';
import type { Beneficiary } from '@/types';

interface BeneficiaryRowProps {
  beneficiary: Beneficiary;
  onPress?: (b: Beneficiary) => void;
}

export const BeneficiaryRow: React.FC<BeneficiaryRowProps> = ({
  beneficiary,
  onPress,
}) => {
  const { initials, maskedName, walletAddress } = beneficiary;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(beneficiary)}
      activeOpacity={0.75}
      style={styles.card}
    >
      <Avatar initials={initials} size={40} />
      <View style={styles.content}>
        <Text style={styles.name}>{maskedName}</Text>
        <View style={styles.hashRow}>
          <Text style={styles.hash}>{walletAddress}</Text>
          <Icon name="copy" size={12} color={Colors.textMuted} />
        </View>
      </View>
      <Icon name="chevron-right" size={15} color={Colors.textMuted} />
    </TouchableOpacity>
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
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hash: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
