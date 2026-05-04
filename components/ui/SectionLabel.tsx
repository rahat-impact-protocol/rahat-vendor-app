import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

interface SectionLabelProps {
  children: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{children.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  text: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.7,
  },
});
