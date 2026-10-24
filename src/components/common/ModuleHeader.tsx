import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

/**
 * Shared module header with back button (Chat / Events / Notifications).
 * Replaces 3 identical `header + backBtn + backText + titleBox` blocks.
 */
export function ModuleHeader({
  title,
  subtitle,
  onClose,
  backLabel = '← Back',
  style,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  backLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.header, style]}>
      <Pressable onPress={onClose} style={s.backBtn} hitSlop={8}>
        <Text style={s.backText}>{backLabel}</Text>
      </Pressable>
      <View style={s.titleBox}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={s.spacer} />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: VolpeTheme.colors.border,
    ...VolpeTheme.shadows.card,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
    borderRadius: VolpeTheme.radius.pill,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: VolpeTheme.colors.primary,
  },
  titleBox: { alignItems: 'center' },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: VolpeTheme.colors.textMuted,
  },
  spacer: { width: 44 },
});
