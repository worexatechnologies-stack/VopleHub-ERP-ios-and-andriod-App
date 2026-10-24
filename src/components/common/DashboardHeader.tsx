import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Bell, Calendar, ChevronRight } from 'lucide-react-native';
import { VolpeTheme } from '../../theme/theme';
import { InitialsAvatar } from './InitialsAvatar';
import type { User } from '../../types/auth';

interface DashboardHeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenEvents?: () => void;
  onOpenNotifs?: () => void;
}

export function DashboardHeader({
  currentUser,
  onLogout,
  onOpenChat,
  onOpenEvents,
  onOpenNotifs,
}: DashboardHeaderProps) {
  const roleLabel = (currentUser.role || 'user').replace('_', ' ').toUpperCase();

  return (
    <View style={s.container}>
      {/* Top School Bar: Logo, School Name, Subtitle, Notification Bell with Badge, User Avatar */}
      <View style={s.topRow}>
        <View style={s.brandGroup}>
          <Image
            source={require('../../assets/volpe_logo.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <View style={s.titleGroup}>
            <Text style={s.schoolName} numberOfLines={1}>
              {currentUser.schoolName}
            </Text>
            <Text style={s.mottoText}>Nurturing Bright Futures</Text>
          </View>
        </View>

        <View style={s.actionsGroup}>
          {onOpenNotifs && (
            <Pressable onPress={onOpenNotifs} style={s.bellButton} hitSlop={8}>
              <Bell size={18} color="#0F172A" />
              <View style={s.notifBadge}>
                <Text style={s.notifBadgeText}>5</Text>
              </View>
            </Pressable>
          )}

          <InitialsAvatar
            name={currentUser.name}
            size={36}
            bgColor="#1E6BFF"
            fontSize={13}
          />

          <Pressable onPress={onLogout} style={s.logoutButton} hitSlop={8}>
            <Text style={s.logoutText}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: VolpeTheme.radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF0F7',
    ...VolpeTheme.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 42,
    height: 42,
  },
  titleGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  mottoText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
});

