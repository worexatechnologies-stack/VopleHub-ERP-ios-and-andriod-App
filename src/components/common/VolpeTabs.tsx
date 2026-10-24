import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

interface TabItem<T extends string> {
  key: T;
  label: string;
  badge?: number | string;
}

interface VolpeTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function VolpeTabs<T extends string>({ tabs, activeTab, onTabChange }: VolpeTabsProps<T>) {
  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={[
                s.pill,
                isSelected ? s.pillSelected : s.pillUnselected,
              ]}
            >
              <Text style={[s.pillText, isSelected ? s.pillTextSelected : s.pillTextUnselected]}>
                {isSelected ? '✓ ' : ''}{tab.label}
              </Text>
              {tab.badge !== undefined && (
                <View style={[s.badge, isSelected ? s.badgeSelected : s.badgeUnselected]}>
                  <Text style={[s.badgeText, isSelected ? s.badgeTextSelected : s.badgeTextUnselected]}>
                    {tab.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: VolpeTheme.radius.pill,
    minHeight: 38,
  },
  pillSelected: {
    backgroundColor: VolpeTheme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: VolpeTheme.colors.primaryBorder,
  },
  pillUnselected: {
    backgroundColor: VolpeTheme.colors.card,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: VolpeTheme.colors.primary,
    fontWeight: '700',
  },
  pillTextUnselected: {
    color: VolpeTheme.colors.textSecondary,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: VolpeTheme.radius.pill,
  },
  badgeSelected: {
    backgroundColor: VolpeTheme.colors.primary,
  },
  badgeUnselected: {
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  badgeTextUnselected: {
    color: VolpeTheme.colors.textMuted,
  },
});
