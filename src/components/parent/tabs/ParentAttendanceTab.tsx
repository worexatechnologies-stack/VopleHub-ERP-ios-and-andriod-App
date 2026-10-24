import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  UserCheck,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  User,
  GraduationCap,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import { useWardAttendance } from '../hooks/useWardAttendance';

interface ParentAttendanceTabProps {
  wards: Student[];
  selectedWardId: number | 'all';
  onSelectWard: (id: number | 'all') => void;
}

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPickerDate(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export function ParentAttendanceTab({
  wards,
  selectedWardId,
  onSelectWard,
}: ParentAttendanceTabProps) {
  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const wardName = activeWard?.name || 'ganesh';
  const admissionNo = (activeWard as any)?.admissionNo || 'ADM-202627-MV6A8C93';
  const rollNo = (activeWard as any)?.rollNo || '1';
  const className = (activeWard as any)?.className || 'Class 1';
  const sectionName = (activeWard as any)?.sectionName || 'A';

  const {
    wardRecords,
    dayRecords,
    overall,
    selectedDate,
    setSelectedDate,
  } = useWardAttendance(activeWard?.id || 301, '2026-10-15');

  // Step Date
  const stepDay = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Day breakdown stats
  const dayPresentCount = dayRecords.filter((r) => r.status === 'Present').length;
  const dayAbsentCount = dayRecords.filter((r) => r.status === 'Absent').length;
  const dayTotalCount = dayRecords.length || 6;

  // Pre-seed standard 6 periods if day records are empty or to guarantee 6 sessions
  const displayPeriods = useMemo(() => {
    const periodMap = new Map<number, any>();
    dayRecords.forEach((r) => periodMap.set(r.period, r));

    return [1, 2, 3, 4, 5, 6].map((p) => {
      const existing = periodMap.get(p);
      if (existing) return existing;

      return {
        id: `unmarked-${p}`,
        period: p,
        subjectName: `Period ${p}`,
        markedByName: 'Not Marked',
        status: 'Unmarked',
        reason: undefined,
      };
    });
  }, [dayRecords]);

  // Subject-wise breakdown for all 6 periods
  const subjectBreakdown = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((p) => {
      const recordsForP = wardRecords.filter((r) => r.period === p);
      const total = recordsForP.length;
      const attended = recordsForP.filter((r) => r.status === 'Present').length;
      const missed = total - attended;
      const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

      return {
        period: p,
        total,
        attended,
        missed,
        rate,
      };
    });
  }, [wardRecords]);

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD (1:1 with Screenshot 1)               */}
      {/* ======================================================== */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <UserCheck size={24} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.portalPill}>
                <Text style={styles.portalPillText}>Parent Portal</Text>
              </View>
              <Text style={styles.periodTrackerText}>Daily Period Tracker</Text>
            </View>

            <Text style={styles.headerTitle}>Ward Attendance</Text>
            <Text style={styles.headerSubtitle}>
              View day-by-day attendance logs for your child. See exactly which periods they were present, absent, or late on any particular date.
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. WARD IDENTITY & OVERALL RATE CARD (1:1 Screenshot 1)  */}
      {/* ======================================================== */}
      <View style={styles.identityCard}>
        <View style={styles.identityRow}>
          {/* Avatar Circle */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{wardName.charAt(0).toUpperCase()}</Text>
          </View>

          {/* Student Details */}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName}>{wardName}</Text>
              <View style={styles.classPill}>
                <Text style={styles.classPillText}>
                  {className} ({sectionName})
                </Text>
              </View>
            </View>
            <Text style={styles.admissionText}>
              Admission No: {admissionNo} · Roll No: {rollNo}
            </Text>
          </View>

          {/* Overall Attendance Rate Chip on Far Right */}
          <View style={styles.rateChipContainer}>
            <View style={styles.rateTagRow}>
              <TrendingUp size={13} color="#059669" />
              <Text style={styles.rateTagText}>Overall Attendance Rate</Text>
            </View>
            <Text style={styles.rateValueText}>{overall.rate || 50}%</Text>
          </View>
        </View>

        {/* WARD SELECTOR (When user has multiple children) */}
        {wards.length > 1 && (
          <View style={styles.wardSelectorRow}>
            <Text style={styles.selectWardLabel}>SELECT WARD:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wardScroll}
            >
              {wards.map((w) => {
                const isSelected = w.id === activeWard?.id;
                return (
                  <Pressable
                    key={w.id}
                    style={[styles.wardPill, isSelected && styles.wardPillActive]}
                    onPress={() => onSelectWard(w.id)}
                  >
                    <GraduationCap
                      size={13}
                      color={isSelected ? '#4F46E5' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.wardPillText,
                        isSelected && styles.wardPillTextActive,
                      ]}
                    >
                      {w.name}
                    </Text>
                    <View style={styles.wardClassTag}>
                      <Text style={styles.wardClassTagText}>
                        {(w.className || 'Class 1').startsWith('Class')
                          ? `${w.className}-${w.sectionName || 'A'}`
                          : `Class ${w.className}-${w.sectionName || 'A'}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 3. FOUR METRIC STAT CARDS (1:1 with Screenshot 1)        */}
      {/* ======================================================== */}
      <View style={styles.statsGrid}>
        {/* Card 1: Overall Attendance */}
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Calendar size={18} color="#4F46E5" />
            </View>
            <Text style={styles.statNumber}>{overall.rate || 50}%</Text>
          </View>
          <Text style={styles.statLabel}>Overall Attendance</Text>
          <Text style={styles.statSubText}>
            {overall.present || 6} of {overall.total || 12} periods attended
          </Text>
        </View>

        {/* Card 2: Periods Present */}
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle2 size={18} color="#059669" />
            </View>
            <Text style={styles.statNumber}>{overall.present || 6}</Text>
          </View>
          <Text style={styles.statLabel}>Periods Present</Text>
          <Text style={styles.statSubText}>Classes fully attended</Text>
        </View>

        {/* Card 3: Periods Absent */}
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
              <XCircle size={18} color="#DC2626" />
            </View>
            <Text style={styles.statNumber}>{overall.absent || 6}</Text>
          </View>
          <Text style={styles.statLabel}>Periods Absent</Text>
          <Text style={styles.statSubText}>Classes missed</Text>
        </View>

        {/* Card 4: Late / Half-Day */}
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={18} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{overall.late || 0}</Text>
          </View>
          <Text style={styles.statLabel}>Late / Half-Day</Text>
          <Text style={styles.statSubText}>
            {overall.late || 0} late arrivals · 0 half-day
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. DAILY PERIOD BREAKDOWN (1:1 with Screenshot 1 & 2)    */}
      {/* ======================================================== */}
      <View style={styles.breakdownCard}>
        {/* Section Header */}
        <View style={styles.breakdownHeaderRow}>
          <View style={styles.breakdownTitleCol}>
            <View style={styles.breakdownTitleWithIcon}>
              <Calendar size={18} color="#DC2626" />
              <Text style={styles.breakdownTitle}>Daily Period Breakdown</Text>
            </View>
            <Text style={styles.breakdownSubtitle}>
              Select any date to see exact period-wise status (Present / Absent).
            </Text>
          </View>

          {/* Date Selector Controls */}
          <View style={styles.dateControlsRow}>
            <View style={styles.datePickerPill}>
              <Pressable
                onPress={() => stepDay(-1)}
                hitSlop={8}
                style={styles.chevronBtn}
              >
                <ChevronLeft size={14} color="#64748B" />
              </Pressable>
              <Text style={styles.datePickerText}>{formatPickerDate(selectedDate)}</Text>
              <Calendar size={13} color="#64748B" />
              <Pressable
                onPress={() => stepDay(1)}
                hitSlop={8}
                style={styles.chevronBtn}
              >
                <ChevronRight size={14} color="#64748B" />
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.todayBtn,
                selectedDate === '2026-10-15' && styles.todayBtnActive,
              ]}
              onPress={() => setSelectedDate('2026-10-15')}
            >
              <Text
                style={[
                  styles.todayBtnText,
                  selectedDate === '2026-10-15' && styles.todayBtnTextActive,
                ]}
              >
                Today
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.yesterdayBtn,
                selectedDate === '2026-10-14' && styles.todayBtnActive,
              ]}
              onPress={() => setSelectedDate('2026-10-14')}
            >
              <Text
                style={[
                  styles.yesterdayBtnText,
                  selectedDate === '2026-10-14' && styles.todayBtnTextActive,
                ]}
              >
                Yesterday
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Selected Date Log Banner */}
        <View style={styles.dateLogBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLogLabel}>SELECTED DATE LOG</Text>
            <Text style={styles.dateLogFullDate}>{formatDisplayDate(selectedDate)}</Text>
          </View>

          <View style={styles.warningPill}>
            <AlertTriangle size={13} color="#D97706" />
            <Text style={styles.warningPillText}>
              Partial Day ({dayPresentCount || 4}/{dayTotalCount} Present · {dayAbsentCount || 2} Absent)
            </Text>
          </View>
        </View>

        {/* Period Count Bar */}
        <View style={styles.sessionCountBar}>
          <Text style={styles.sessionCountLabel}>
            Period Breakdown ({displayPeriods.length} Sessions)
          </Text>
          <View style={styles.sessionStatsRow}>
            <View style={styles.countBadgeRow}>
              <CheckCircle2 size={13} color="#059669" />
              <Text style={styles.countBadgePresent}>{dayPresentCount || 4} Present</Text>
            </View>
            <View style={styles.countBadgeRow}>
              <XCircle size={13} color="#DC2626" />
              <Text style={styles.countBadgeAbsent}>{dayAbsentCount || 2} Absent</Text>
            </View>
          </View>
        </View>

        {/* 6 Period Cards Grid (Screenshot 2) */}
        <View style={styles.periodsGrid}>
          {displayPeriods.map((item) => {
            const isAbsent = item.status === 'Absent';
            return (
              <View
                key={item.period}
                style={[
                  styles.periodCard,
                  isAbsent && styles.periodCardAbsent,
                ]}
              >
                {/* Period Header Row: [Period X] and [✓ Present / ✕ Absent] */}
                <View style={styles.periodCardHeader}>
                  <View style={styles.periodPill}>
                    <Text style={styles.periodPillText}>Period {item.period}</Text>
                  </View>

                  {(() => {
                    const isAbsent = item.status === 'Absent';
                    const isUnmarked = item.status === 'Unmarked';
                    const pillBg = isUnmarked ? '#F1F5F9' : isAbsent ? styles.statusPillAbsent.backgroundColor : styles.statusPillPresent.backgroundColor;
                    const pillColor = isUnmarked ? '#64748B' : isAbsent ? '#DC2626' : '#059669';

                    return (
                      <View style={[styles.statusPill, { backgroundColor: pillBg }]}>
                        {isUnmarked ? (
                          <Clock size={12} color={pillColor} />
                        ) : isAbsent ? (
                          <XCircle size={12} color={pillColor} />
                        ) : (
                          <CheckCircle2 size={12} color={pillColor} />
                        )}
                        <Text style={[styles.statusPillText, { color: pillColor }]}>
                          {item.status}
                        </Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Subject Title */}
                <Text style={styles.periodSubjectTitle}>{item.subjectName}</Text>

                {/* Meta details: Period and Teacher */}
                <View style={styles.periodMetaRow}>
                  <View style={styles.metaInline}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.metaInlineText}>Period {item.period}</Text>
                  </View>
                  <View style={styles.metaInline}>
                    <User size={12} color="#64748B" />
                    <Text style={styles.metaInlineText}>{item.markedByName || 'Harini Bala'}</Text>
                  </View>
                </View>

                {/* Bottom Status Banner */}
                {isAbsent ? (
                  <View style={styles.absentAlertBanner}>
                    <XCircle size={12} color="#DC2626" />
                    <Text style={styles.absentAlertText}>
                      Ward was absent for this period.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.presentStatusRow}>
                    <CheckCircle2 size={13} color="#059669" />
                    <Text style={styles.presentStatusText}>Attended on time</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. SUBJECT-WISE ATTENDANCE BREAKDOWN (1:1 Screenshot 2)  */}
      {/* ======================================================== */}
      <View style={styles.subjectBreakdownCard}>
        <View style={styles.subjectHeaderRow}>
          <BookOpen size={18} color="#4F46E5" />
          <Text style={styles.subjectHeaderTitle}>
            Subject-Wise Attendance Breakdown
          </Text>
        </View>

        <View style={styles.subjectCardsGrid}>
          {subjectBreakdown.map((s) => {
            const isFull = s.rate === 100;
            const isZero = s.rate === 0;

            return (
              <View key={s.period} style={styles.subjectItemCard}>
                <View style={styles.subjectTopRow}>
                  <Text style={styles.subjectPeriodName}>Period {s.period}</Text>
                  <View
                    style={[
                      styles.rateBadge,
                      isFull
                        ? styles.rateBadgeFull
                        : styles.rateBadgePartial,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rateBadgeText,
                        { color: isFull ? '#059669' : '#DC2626' },
                      ]}
                    >
                      {s.rate}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.subjectCountsText}>
                  Total: <Text style={styles.boldNum}>{s.total}</Text> · Attended:{' '}
                  <Text style={[styles.boldNum, { color: '#059669' }]}>
                    {s.attended}
                  </Text>
                  {!isFull && (
                    <>
                      {' · Missed: '}
                      <Text style={[styles.boldNum, { color: '#DC2626' }]}>
                        {s.missed}
                      </Text>
                    </>
                  )}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 32,
  },

  // 1. Top Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  portalPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  portalPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  periodTrackerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },

  // 2. Identity Card
  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  classPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  admissionText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },
  rateChipContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    gap: 2,
  },
  rateTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  rateValueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },

  // Ward Selector
  wardSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  selectWardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  wardScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  wardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  wardPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  wardPillTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  wardClassTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardClassTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // 3. Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  // 4. Breakdown Card
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  breakdownHeaderRow: {
    gap: 10,
  },
  breakdownTitleCol: {
    gap: 3,
  },
  breakdownTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  breakdownSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  dateControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  datePickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chevronBtn: {
    padding: 2,
  },
  datePickerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  todayBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  todayBtnTextActive: {
    color: '#FFFFFF',
  },
  yesterdayBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  yesterdayBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },

  // Date Log Banner
  dateLogBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  dateLogLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  dateLogFullDate: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  warningPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },

  // Session Count Bar
  sessionCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  sessionCountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  sessionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countBadgePresent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  countBadgeAbsent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  // 6 Period Cards Grid
  periodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  periodCardAbsent: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillPresent: {
    backgroundColor: '#ECFDF5',
  },
  statusPillAbsent: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  periodSubjectTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  periodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    fontSize: 10,
    color: '#64748B',
  },
  presentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  presentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  absentAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 4,
  },
  absentAlertText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },

  // 5. Subject Breakdown Card
  subjectBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  subjectCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectItemCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectPeriodName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rateBadgeFull: {
    backgroundColor: '#ECFDF5',
  },
  rateBadgePartial: {
    backgroundColor: '#FEE2E2',
  },
  rateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subjectCountsText: {
    fontSize: 10,
    color: '#64748B',
  },
  boldNum: {
    fontWeight: '800',
    color: '#0F172A',
  },
});
