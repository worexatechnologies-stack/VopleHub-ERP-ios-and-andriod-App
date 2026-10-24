import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode | string;
  badge?: string;
  colorScheme?: 'blue' | 'teal' | 'amber' | 'pink' | 'lime' | 'purple' | 'emerald' | 'rose';
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  colorScheme = 'blue',
  valueColor,
  style,
  onPress,
}: StatCardProps) {
  const schemeStyles = {
    blue: { bg: VolpeTheme.colors.primaryLight, border: VolpeTheme.colors.primaryBorder, text: VolpeTheme.colors.primary },
    teal: { bg: VolpeTheme.colors.accentTealLight, border: '#A7F3D0', text: VolpeTheme.colors.accentTeal },
    amber: { bg: VolpeTheme.colors.accentYellowLight, border: '#FDE68A', text: '#D97706' },
    pink: { bg: VolpeTheme.colors.accentPinkLight, border: '#FBCFE8', text: VolpeTheme.colors.accentPink },
    lime: { bg: VolpeTheme.colors.accentLimeLight, border: '#D9F99D', text: '#4D7C0F' },
    purple: { bg: VolpeTheme.colors.accentPurpleLight, border: '#DDD6FE', text: VolpeTheme.colors.accentPurple },
    emerald: { bg: '#DCFCE7', border: '#86EFAC', text: '#16A34A' },
    rose: { bg: '#FFE4E6', border: '#FECDD3', text: '#E11D48' },
  }[colorScheme];

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {badge ? (
          <View style={[styles.badgeWrap, { backgroundColor: schemeStyles.bg }]}>
            <Text style={[styles.badgeText, { color: schemeStyles.text }]}>{badge}</Text>
          </View>
        ) : icon ? (
          <View style={[styles.iconBox, { backgroundColor: schemeStyles.bg }]}>
            {typeof icon === 'string' ? (
              <Text style={styles.emojiText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        ) : null}
      </View>
      <Text style={[styles.value, { color: valueColor || schemeStyles.text }]}>
        {value}
      </Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 14,
  },
  badgeWrap: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
