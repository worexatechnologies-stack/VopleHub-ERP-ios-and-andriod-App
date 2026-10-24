import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { VolpeTheme } from '../../theme/theme';

/**
 * Shared portal shell: sidebar (wide) + drawer (narrow) + top bar + quick tabs + scroll content.
 * Eliminates the ~90-line duplicated layout block in TeacherDashboard & StudentDashboard.
 */
import { PortalSidebar, PortalNavItem } from './PortalSidebar';
import { PortalDrawer } from './PortalDrawer';
import { PortalTopBar } from './PortalTopBar';
import { PortalQuickTabs } from './PortalQuickTabs';
import { useResponsive } from '../../hooks/useResponsive';

export function PortalShell<T extends string>({
  items,
  activeTab,
  onSelectTab,
  userRole,
  breadcrumbLabel,
  userName,
  onLogout,
  showSchoolArt,
  cycleText,
  cleanTopBar,
  hideQuickTabsOnWide = true,
  onPressNotifications,
  children,
}: {
  items: PortalNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  userRole: string;
  breadcrumbLabel: string;
  userName: string;
  onLogout: () => void;
  showSchoolArt?: boolean;
  cycleText?: string;
  cleanTopBar?: boolean;
  hideQuickTabsOnWide?: boolean;
  onPressNotifications?: () => void;
  children: React.ReactNode;
}) {
  const { isWide } = useResponsive();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleSelect = (tab: T) => {
    onSelectTab(tab);
    setDrawerOpen(false);
  };

  return (
    <View style={s.root}>
      {isWide ? (
        <View style={{ width: 280, height: '100%' }}>
          <PortalSidebar items={items} activeTab={activeTab} onSelectTab={handleSelect} userRole={userRole} />
        </View>
      ) : (
        <PortalDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={items}
          activeTab={activeTab}
          onSelectTab={handleSelect}
          userRole={userRole}
        />
      )}
      <View style={s.mainWorkspace}>
        <PortalTopBar
          breadcrumbLabel={breadcrumbLabel}
          userName={userName}
          userRole={userRole}
          showSchoolArt={showSchoolArt}
          cycleText={cycleText}
          cleanMode={cleanTopBar}
          onOpenDrawer={() => setDrawerOpen(true)}
          onLogout={onLogout}
          onPressNotifications={onPressNotifications}
        />
        <View style={s.content}>{children}</View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: VolpeTheme.colors.background,
  },
  mainWorkspace: {
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
  },
  content: {
    flex: 1,
  },
});

/**
 * Shared selectable pill row (child switcher, conv chips, prompt pills, notif filters).
 * Replaces childPill / convChip / promptPill / notif pill duplications.
 */
export function SelectablePills<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>;
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={pills.row}>
      {options.map((o) => {
        const isSelected = selected === o.value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onSelect(o.value)}
            style={[pills.pill, isSelected && pills.pillSelected]}
          >
            <Text style={[pills.pillText, isSelected && pills.pillTextSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const pills = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: VolpeTheme.radius.pill,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  pillSelected: {
    backgroundColor: VolpeTheme.colors.primaryLight,
    borderColor: VolpeTheme.colors.primaryBorder,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: VolpeTheme.colors.textSecondary,
  },
  pillTextSelected: {
    color: VolpeTheme.colors.primary,
    fontWeight: '700',
  },
});
