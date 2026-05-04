import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

interface AvatarProps {
  initials: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 38,
  backgroundColor = Colors.primarySubtle,
  textColor = Colors.primary,
}) => {
  const fontSize = Math.round(size * 0.32);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color: textColor,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontFamily: 'Manrope',
    fontWeight: '700',
  },
});
