import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

/**
 * Shared centered loading indicator.
 * Replaces ~6 copy-pasted `centerLoading + loadingText` blocks in
 * TeacherDashboard, StudentDashboard, ParentDashboard, ChatModule, EventsModule.
 */
export function LoadingView({
  message = 'Loading...',
  color,
  style,
}: {
  message?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.centerLoading, style]}>
      <ActivityIndicator size="large" color={color || VolpeTheme.colors.primary} />
      <Text style={s.loadingText}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  centerLoading: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: VolpeTheme.colors.textMuted,
    fontWeight: '500',
  },
});
