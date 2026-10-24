import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

/**
 * Shared card primitives — replaces heroCard / panelCard / dashCard /
 * profileCard / attendanceHeroCard / chatbotCard duplications across
 * Teacher / Student / Parent dashboards.
 */
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.cardTitle}>{children}</Text>;
}

export function CardSubtitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.cardSub}>{children}</Text>;
}

/** Gradient-style hero banner (solid navy/indigo — avoids extra dep). */
export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  children,
  style,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.hero, style]}>
      {eyebrow ? <Text style={s.heroEyebrow}>{eyebrow}</Text> : null}
      <Text style={s.heroTitle}>{title}</Text>
      {subtitle ? <Text style={s.heroSub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: VolpeTheme.colors.card,
    borderRadius: VolpeTheme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
    ...VolpeTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  cardSub: {
    fontSize: 13,
    color: VolpeTheme.colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  hero: {
    backgroundColor: '#1E1B4B',
    borderRadius: VolpeTheme.radius.xl,
    padding: 18,
    ...VolpeTheme.shadows.card,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A5B4FC',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 4,
    lineHeight: 18,
  },
});
