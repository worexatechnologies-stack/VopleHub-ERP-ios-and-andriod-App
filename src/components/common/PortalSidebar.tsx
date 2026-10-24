import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Shield,
} from 'lucide-react-native';

export interface PortalNavItem<T extends string> {
  id: T;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  badge?: number | string;
}

interface PortalSidebarProps<T extends string> {
  items: PortalNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  userRole: string;
  onClose?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export function PortalSidebar<T extends string>({
  items,
  activeTab,
  onSelectTab,
  userRole,
  onClose,
  brandTitle = 'VOLPEHUB EDUCATION',
  brandSubtitle = 'School management portal',
}: PortalSidebarProps<T>) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets?.bottom || 0, Platform.OS === 'ios' ? 34 : 26);
  return (
    <View style={styles.container}>
      {/* 1. Brand Header matching web portal */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/volpe_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            {brandTitle}
          </Text>
          <View style={styles.subTitleRow}>
            <View style={styles.blueDot} />
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {brandSubtitle}
            </Text>
          </View>
        </View>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={10} style={styles.collapseBtn}>
            <ChevronLeft size={16} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {/* 2. Navigation Section Label */}
      <View style={styles.navSectionHeader}>
        <View style={styles.navSectionTitleRow}>
          <Layers size={13} color="#64748B" />
          <Text style={styles.navSectionTitle}>NAVIGATION</Text>
        </View>
      </View>

      {/* 3. Navigation Items with Glowing Active State & Chevron */}
      <ScrollView
        style={styles.navScroll}
        contentContainerStyle={styles.navScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navGroup}>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            const IconComp = item.icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectTab(item.id)}
                style={[
                  styles.navItem,
                  isActive ? styles.navItemActive : styles.navItemInactive,
                ]}
              >
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                  <IconComp
                    size={17}
                    color={isActive ? '#818CF8' : '#94A3B8'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </View>

                <Text
                  style={[styles.navLabel, isActive && styles.navLabelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>

                {item.badge !== undefined && item.badge !== null && item.badge !== '' && item.badge !== 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : isActive ? (
                  <ChevronRight size={15} color="#818CF8" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 4. Security Footer (Exact 1-1 Match with Web Portal) */}
      <View style={[styles.footer, { paddingBottom: bottomInset + 10 }]}>
        {/* System Secured Box with 256-BIT badge & Shield */}
        <View style={styles.securityBox}>
          <View style={styles.secTopRow}>
            <View style={styles.secStatusRow}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.secLabel}>SYSTEM SECURED</Text>
            </View>
            <View style={styles.bitBadge}>
              <Text style={styles.bitBadgeText}>256-BIT</Text>
            </View>
          </View>

          <View style={styles.secBottomRow}>
            <View>
              <Text style={styles.activeRoleLabel}>ACTIVE ROLE</Text>
              <Text style={styles.secRole}>ROLE: {userRole.toUpperCase()}</Text>
            </View>
            <View style={styles.shieldWrap}>
              <Shield size={16} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Powered by Worexa Technologies (Exact Match) */}
        <View style={styles.poweredByBox}>
          <View style={styles.worexaWrap}>
            <Text style={styles.worexaChar}>W</Text>
          </View>
          <View>
            <Text style={styles.poweredBySmall}>POWERED BY</Text>
            <Text style={styles.worexaName}>Worexa Technologies</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#090D16', // Dark sleek slate background matching web
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    flexDirection: 'column',
    height: '100%',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  blueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6366F1',
  },
  brandSubtitle: {
    color: '#818CF8',
    fontSize: 9.5,
    fontWeight: '600',
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Navigation Section Header */
  navSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navSectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  navCountBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  navCountText: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Navigation Items */
  navScroll: {
    flex: 1,
    paddingTop: 4,
  },
  navScrollContent: {
    paddingBottom: 20,
  },
  navGroup: {
    paddingHorizontal: 10,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(30, 27, 75, 0.75)',
    borderColor: '#4F46E5', // Glowing purple-indigo border matching web
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconBoxActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  navLabel: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#EF4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Security Footer */
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  securityBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  secTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  secLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bitBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bitBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  secBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRoleLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secRole: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  shieldWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Powered by Worexa */
  poweredByBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  worexaWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worexaChar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  poweredBySmall: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  worexaName: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
});
