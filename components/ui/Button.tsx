import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/tokens';
import { Icon } from './Icon';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
}

const variantConfig: Record<ButtonVariant, { bg: string; color: string; border?: string }> = {
  solid:   { bg: Colors.primary,   color: '#fff' },
  outline: { bg: '#fff',           color: Colors.primary,  border: Colors.primary },
  ghost:   { bg: '#F9FAFB',        color: Colors.textBody, border: '#E5E7EB' },
  danger:  { bg: '#fff',           color: Colors.error,    border: '#FCA5A5' },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const vc = variantConfig[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: vc.bg,
          borderColor: vc.border ?? 'transparent',
          borderWidth: vc.border ? 1.5 : 0,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vc.color} />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={16}
              color={variant === 'solid' ? '#fff' : Colors.primary}
            />
          )}
          <Text style={[styles.label, { color: vc.color }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
  },
});
