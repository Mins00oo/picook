import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, shadow } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    disabled && styles.labelDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: 8,
    ...shadow.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 36,
  },
  size_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 44,
  },
  size_large: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    height: 52,
  },
  disabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontWeight: '600',
  },
  label_primary: {
    color: colors.textInverse,
  },
  label_secondary: {
    color: colors.secondary,
  },
  label_outline: {
    color: colors.textPrimary,
  },
  label_ghost: {
    color: colors.primary,
  },
  labelSize_small: {
    fontSize: 14,
  },
  labelSize_medium: {
    fontSize: 16,
  },
  labelSize_large: {
    fontSize: 17,
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
});
