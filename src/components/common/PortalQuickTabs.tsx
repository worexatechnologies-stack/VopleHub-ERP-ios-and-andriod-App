import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import type { PortalNavItem } from './PortalSidebar';

/**
 * Shared horizontal quick-tab bar (mobile / tablet 1-tap switching).
 * Previously duplicated verbatim in TeacherDashboard + StudentDashboard
 * (horizontalTabBar / quickTabPill / quickBadge styles + render loop).
 */
export function PortalQuickTabs<T extends string>({
  items,
  activeTab,
  onSelectTab,
  style,
}: {
  items: PortalNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.horizontalTabBar, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const IconComp = item.icon;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectTab(item.id)}
              style={[s.quickTabPill, isActive && s.quickTabPillActive]}
            >
              <IconComp size={13} color={isActive ? '#FFFFFF' : '#64748B'} />
              <Text style={[s.quickTabPillText, isActive && s.quickTabPillTextActive]}>
                {item.label}
              </Text>
              {item.badge !== undefined && item.badge !== null && item.badge !== '' && item.badge !== 0 && (
                <View style={[s.quickBadge, isActive && s.quickBadgeActive]}>
                  <Text style={[s.quickBadgeText, isActive && s.quickBadgeTextActive]}>
                    {item.badge}
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
  horizontalTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: VolpeTheme.colors.border,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: VolpeTheme.radius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
    marginRight: 6,
  },
  quickTabPillActive: {
    backgroundColor: VolpeTheme.colors.primary,
    borderColor: VolpeTheme.colors.primary,
  },
  quickTabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: VolpeTheme.colors.textSecondary,
  },
  quickTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: VolpeTheme.radius.pill,
  },
  quickBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  quickBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: VolpeTheme.colors.textSecondary,
  },
  quickBadgeTextActive: {
    color: '#FFFFFF',
  },
});
