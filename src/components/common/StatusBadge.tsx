import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { getStatusTheme } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string | undefined | null;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'outline' | 'solid';
  customColor?: string;
  customBg?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function StatusBadge({
  status,
  label,
  showDot = false,
  size = 'md',
  variant = 'subtle',
  customColor,
  customBg,
  style,
  textStyle,
}: StatusBadgeProps) {
  const theme = getStatusTheme(status);
  const displayLabel = label || status || 'Unknown';

  const sizeStyles = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, dotSize: 5 },
    md: { paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, dotSize: 6 },
    lg: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, dotSize: 7 },
  }[size];

  const bg = customBg || (variant === 'outline' ? 'transparent' : variant === 'solid' ? theme.text : theme.bg);
  const color = customColor || (variant === 'solid' ? '#FFFFFF' : theme.text);
  const borderColor = variant === 'outline' ? (customColor || theme.text) : theme.border;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: borderColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              borderRadius: sizeStyles.dotSize / 2,
              backgroundColor: color,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: color,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
