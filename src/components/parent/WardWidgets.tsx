import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import type { Student } from '../../types/student';
import { InitialsAvatar, StatusBadge, EmptyState, Card } from '../common';
import type {} from '../../utils';

/**
 * Shared ward switcher — single place for "Select Ward / All Children" logic.
 * Previously duplicated (with drift) in dashboard, academic, attendance, notices, fees, exams, chat.
 */
export function WardSwitcher({
  wards,
  selectedWardId,
  onSelect,
  showAllOption = true,
}: {
  wards: Student[];
  selectedWardId: number | 'all';
  onSelect: (id: number | 'all') => void;
  showAllOption?: boolean;
}) {
  if (wards.length <= 1 && !showAllOption) return null;
  return (
    <View style={s.wrap}>
      <Text style={s.label}>SELECT WARD:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {showAllOption && wards.length > 1 && (
          <Pressable
            onPress={() => onSelect('all')}
            style={[s.pill, selectedWardId === 'all' && s.pillActive]}
          >
            <Text style={[s.pillText, selectedWardId === 'all' && s.pillTextActive]}>
              All Children ({wards.length})
            </Text>
          </Pressable>
        )}
        {wards.map((w) => {
          const isActive = selectedWardId === w.id;
          return (
            <Pressable key={w.id} onPress={() => onSelect(w.id)} style={[s.pill, isActive && s.pillActive]}>
              <InitialsAvatar name={w.name} size={22} fontSize={9} />
              <Text style={[s.pillText, isActive && s.pillTextActive]} numberOfLines={1}>
                {w.name} · {(w.className || '').replace('Class ', '')}-{w.sectionName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Active-ward profile header card shared by dashboard + academic + attendance + exams. */
export function WardProfileCard({
  ward,
  extra,
  onViewTimetable,
  onCheckAttendance,
}: {
  ward: Student | undefined;
  extra?: React.ReactNode;
  onViewTimetable?: () => void;
  onCheckAttendance?: () => void;
}) {
  if (!ward) return <EmptyState title="No ward linked" subtitle="No children are linked to this parent account yet." />;
  return (
    <Card style={s.profile}>
      <InitialsAvatar name={ward.name} size={58} fontSize={20} />
      <View style={s.profileMeta}>
        <Text style={s.profileName}>{ward.name}</Text>
        <Text style={s.profileSub}>
          Admission #{ward.admissionNo} · Roll #{ward.rollNo}
        </Text>
        <View style={s.badgeRow}>
          <StatusBadge
            status={`${ward.className} ${ward.sectionName}`}
            customBg={VolpeTheme.colors.primaryLight}
            customColor={VolpeTheme.colors.primary}
          />
          <StatusBadge status="Good Standing" />
        </View>
        {extra}
        {(onViewTimetable || onCheckAttendance) && (
          <View style={s.profileBtns}>
            {onViewTimetable && (
              <Pressable onPress={onViewTimetable} style={s.linkBtn}>
                <Text style={s.linkText}>View Full Timetable →</Text>
              </Pressable>
            )}
            {onCheckAttendance && (
              <Pressable onPress={onCheckAttendance} style={s.linkBtn}>
                <Text style={s.linkText}>Check Attendance →</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

/** SVG-free attendance ring (percent circle). Single impl — replaces 3 copies. */
export function AttendanceRing({
  percentage,
  size = 92,
  label,
}: {
  percentage: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const color = pct >= 85 ? '#10B981' : pct >= 70 ? '#D97706' : '#DC2626';
  return (
    <View style={[s.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[s.ringPct, { color }]}>{pct}%</Text>
      <Text style={s.ringLabel}>{label || 'PRESENT'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: VolpeTheme.colors.textMuted },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: VolpeTheme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  pillActive: { backgroundColor: VolpeTheme.colors.primaryLight, borderColor: VolpeTheme.colors.primaryBorder },
  pillText: { fontSize: 11, fontWeight: '700', color: VolpeTheme.colors.textSecondary, maxWidth: 160 },
  pillTextActive: { color: VolpeTheme.colors.primary },
  profile: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  profileMeta: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontWeight: '800', color: VolpeTheme.colors.textPrimary },
  profileSub: { fontSize: 11, color: VolpeTheme.colors.textMuted },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  profileBtns: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  linkBtn: { paddingVertical: 4 },
  linkText: { fontSize: 12, fontWeight: '700', color: VolpeTheme.colors.primary },
  ring: {
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  ringPct: { fontSize: 20, fontWeight: '900' },
  ringLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, color: VolpeTheme.colors.textMuted },
});
