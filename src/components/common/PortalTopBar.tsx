import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Menu, LogOut, Calendar, Star, ShieldCheck, Bell } from 'lucide-react-native';
import { InitialsAvatar } from './InitialsAvatar';
import { useResponsive } from '../../hooks/useResponsive';
import { CYCLE_LABEL } from '../../utils/constants';

interface PortalTopBarProps {
  breadcrumbLabel: string;
  userName: string;
  userRole: string;
  cycleText?: string;
  showSchoolArt?: boolean;
  cleanMode?: boolean;
  onOpenDrawer?: () => void;
  onLogout: () => void;
  onPressNotifications?: () => void;
}

export function PortalTopBar({
  breadcrumbLabel,
  userName,
  userRole,
  cycleText = CYCLE_LABEL,
  showSchoolArt = false,
  cleanMode = false,
  onOpenDrawer,
  onLogout,
  onPressNotifications,
}: PortalTopBarProps) {
  const { width, isWide, isMobile, isSmallMobile } = useResponsive();

  if (cleanMode) {
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {onOpenDrawer && (
            <Pressable
              onPress={onOpenDrawer}
              style={styles.cleanMenuBtn}
              hitSlop={8}
            >
              <Menu size={20} color="#334155" />
            </Pressable>
          )}
        </View>

        <View style={styles.cleanRightRow}>
          <Pressable onPress={onLogout} style={styles.cleanActionBtn} hitSlop={8}>
            <LogOut size={16} color="#475569" />
          </Pressable>
          <Pressable
            style={styles.cleanActionBtn}
            hitSlop={8}
            onPress={
              onPressNotifications ||
              (() =>
                Alert.alert(
                  'Notice Center',
                  'All academic notices, schedules, and broadcasts are up-to-date.'
                ))
            }
          >
            <Bell size={16} color="#475569" />
            <View style={styles.bellDot} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.topBar}>
      {/* Left: Hamburger menu + Breadcrumbs */}
      <View style={styles.topBarLeft}>
        {!isWide && onOpenDrawer && (
          <Pressable
            onPress={onOpenDrawer}
            style={styles.hamburgerBtn}
            hitSlop={8}
          >
            <Menu size={18} color="#334155" />
          </Pressable>
        )}

        <View style={styles.breadcrumbRow}>
          {!isSmallMobile && (
            <>
              <Text style={styles.breadcrumbMuted}>Workspace</Text>
              <Text style={styles.breadcrumbSeparator}>/</Text>
            </>
          )}
          <Text
            style={[
              styles.breadcrumbActive,
              isMobile && { maxWidth: width - (isSmallMobile ? 120 : 180) },
            ]}
            numberOfLines={1}
          >
            {breadcrumbLabel}
          </Text>
        </View>
      </View>

      {/* Right: Status Pills & Profile */}
      <View style={styles.topBarRight}>
        {isWide && (
          <View style={styles.campusPill}>
            <ShieldCheck size={12} color="#4F46E5" />
            <Text style={styles.campusPillText}>CAMPUS PORTAL ACTIVE</Text>
          </View>
        )}

        {isWide ? (
          <>
            <View style={styles.livePill}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.livePillText}>SYSTEM LIVE</Text>
            </View>

            <View style={styles.cyclePill}>
              <Calendar size={13} color="#4F46E5" />
              <Text style={styles.cyclePillText}>{cycleText}</Text>
            </View>
          </>
        ) : (
          <View style={styles.livePill}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        )}

        {/* Profile Avatar & Logout */}
        <View style={styles.userPill}>
          <InitialsAvatar
            name={userName}
            size={30}
            bgColor="#4F46E5"
            fontSize={12}
          />
          {!isMobile && (
            <View style={styles.userMetaCol}>
              <Text style={styles.navUserName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.navUserRole}>{userRole.toUpperCase()}</Text>
            </View>
          )}
          <Pressable onPress={onLogout} style={styles.navLogoutBtn} hitSlop={8}>
            <LogOut size={15} color="#64748B" />
          </Pressable>
        </View>

        {/* Notice Bell */}
        <Pressable
          style={styles.bellBtn}
          hitSlop={8}
          onPress={
            onPressNotifications ||
            (() =>
              Alert.alert(
                'Notice Center',
                'All academic notices, schedules, and broadcasts are up-to-date.'
              ))
          }
        >
          <Bell size={16} color="#64748B" />
          <View style={styles.bellDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  breadcrumbMuted: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  breadcrumbActive: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  schoolArtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  schoolArtText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DB2777',
    letterSpacing: 0.3,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  cyclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  cyclePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.3,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    paddingRight: 6,
    paddingVertical: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userMetaCol: {
    maxWidth: 100,
  },
  navUserName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  navUserRole: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  navLogoutBtn: {
    padding: 4,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  campusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.3,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cleanMenuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cleanActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});
