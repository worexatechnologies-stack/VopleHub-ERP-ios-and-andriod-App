import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Clock,
  Calendar,
  Printer,
  BookOpen,
  Bell,
  MapPin,
  CheckCircle2,
  Table,
  Layers,
  ChevronRight,
  User,
} from 'lucide-react-native';
import { Card } from '../../common';
import type { TimetableSlot } from '../../../types/academic';
import { filterSlotsByDay, slotSubjectLabel, slotClassLabel } from '../../../utils';

interface TeacherAcademicTabProps {
  slots?: TimetableSlot[];
  teacherName?: string;
  visibleSubjects?: any[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PeriodDefinition {
  periodNum?: number;
  periodLabel: string;
  defaultTime: string;
  isBreak?: boolean;
  isLunch?: boolean;
}

const STANDARD_PERIODS: PeriodDefinition[] = [
  { periodNum: 1, periodLabel: 'PERIOD 1', defaultTime: '8:30 AM - 9:15 AM' },
  { periodNum: 2, periodLabel: 'PERIOD 2', defaultTime: '9:15 AM - 10:00 AM' },
  { periodLabel: 'BREAK', defaultTime: '10:00 AM - 10:15 AM', isBreak: true },
  { periodNum: 3, periodLabel: 'PERIOD 3', defaultTime: '10:15 AM - 11:00 AM' },
  { periodNum: 4, periodLabel: 'PERIOD 4', defaultTime: '11:00 AM - 11:45 AM' },
  { periodLabel: 'LUNCH', defaultTime: '11:45 AM - 12:30 PM', isLunch: true },
  { periodNum: 5, periodLabel: 'PERIOD 5', defaultTime: '12:30 PM - 1:15 PM' },
  { periodNum: 6, periodLabel: 'PERIOD 6', defaultTime: '1:15 PM - 2:00 PM' },
];

export function TeacherAcademicTab({
  slots = [],
  teacherName = 'Teacher',
  visibleSubjects = [],
}: TeacherAcademicTabProps) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'matrix'>('day');

  // Active slots for selected day from real API
  const dynamicSlots = filterSlotsByDay(slots, selectedDay);

  const handlePrint = () => {
    Alert.alert(
      'Print Master Timetable',
      `Timetable for ${teacherName} formatted for A4 landscape print. Prepared for Cycle 2026-27.`
    );
  };

  const handleDailyAgenda = () => {
    const lectureCount = dynamicSlots.length;
    Alert.alert(
      `${selectedDay} Agenda`,
      `You have ${lectureCount} lecture period(s) scheduled on ${selectedDay}.`
    );
  };

  return (
    <View style={s.col}>
      {/* 1. TOP HEADER BANNER 1: TIMETABLE MANAGEMENT */}
      <Card style={s.headerBannerCard}>
        <View style={s.bannerTopRow}>
          <View style={s.clockCircle}>
            <Clock size={18} color="#FFFFFF" />
          </View>
          <View style={s.bannerContent}>
            <View style={s.pillRow}>
              <View style={s.purplePill}>
                <View style={s.purpleDot} />
                <Text style={s.purplePillText}>Academic Schedules</Text>
              </View>
            </View>
            <Text style={s.bannerTitle}>Timetable Management</Text>
            <Text style={s.bannerSub}>
              Coordinate school schedules, track class timetables, and monitor period allocations.
            </Text>
          </View>
        </View>
      </Card>

      {/* 2. TOP HEADER BANNER 2: TEACHER LECTURE SCHEDULE */}
      <Card style={s.headerBannerCard}>
        <View style={s.bannerTopRow}>
          <View style={[s.clockCircle, { backgroundColor: '#6366F1' }]}>
            <Clock size={18} color="#FFFFFF" />
          </View>
          <View style={s.bannerContent}>
            <View style={s.pillRow}>
              <View style={[s.purplePill, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                <View style={[s.purpleDot, { backgroundColor: '#4F46E5' }] } />
                <Text style={[s.purplePillText, { color: '#4F46E5' }]}>Active Session Timetable</Text>
              </View>
            </View>
            <Text style={s.bannerTitle}>Teacher Lecture Schedule: {teacherName}</Text>
            <Text style={s.bannerSub}>
              Track your assigned lecture hours, class periods, and room assignments.
            </Text>
          </View>
        </View>

        {/* Action Buttons: Daily Agenda & Print */}
        <View style={s.bannerActionRow}>
          <Pressable onPress={handleDailyAgenda} style={s.agendaBtn}>
            <Calendar size={14} color="#1E293B" />
            <Text style={s.agendaBtnText}>Daily Agenda</Text>
          </Pressable>
          <Pressable onPress={handlePrint} style={s.printBtn}>
            <Printer size={14} color="#1E293B" />
            <Text style={s.printBtnText}>Print</Text>
          </Pressable>
        </View>
      </Card>

      {/* 3. MASTER TIMETABLE SCHEDULE CARD */}
      <Card style={s.timetableCard}>
        {/* Header of Timetable */}
        <View style={s.timetableHeader}>
          <View style={{ flex: 1, minWidth: 180, marginRight: 8 }}>
            <View style={s.teacherWiseRow}>
              <User size={14} color="#1E6BFF" />
              <Text style={s.teacherWiseText} numberOfLines={2}>
                TEACHER-WISE SCHEDULE: {teacherName.toUpperCase()}
              </Text>
            </View>
            <Text style={s.teacherWiseSub}>
              Consolidated lecture sessions across all rostered campus branches.
            </Text>
          </View>
          <Pressable onPress={handlePrint} style={s.miniPrintBtn}>
            <Printer size={13} color="#475569" />
            <Text style={s.miniPrintText}>Print Timetable</Text>
          </Pressable>
        </View>

        {/* View Mode Toggle: Day View vs Full Weekly Matrix */}
        <View style={s.viewModeRow}>
          <Pressable
            onPress={() => setViewMode('day')}
            style={[s.viewModeBtn, viewMode === 'day' && s.viewModeBtnActive]}
          >
            <Calendar size={14} color={viewMode === 'day' ? '#FFFFFF' : '#475569'} />
            <Text style={[s.viewModeText, viewMode === 'day' && s.viewModeTextActive]}>
              Day View
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('matrix')}
            style={[s.viewModeBtn, viewMode === 'matrix' && s.viewModeBtnActive]}
          >
            <Table size={14} color={viewMode === 'matrix' ? '#FFFFFF' : '#475569'} />
            <Text style={[s.viewModeText, viewMode === 'matrix' && s.viewModeTextActive]}>
              Full Weekly Matrix
            </Text>
          </Pressable>
        </View>

        {/* DAY VIEW MODE */}
        {viewMode === 'day' && (
          <View>
            {/* Days Horizontal Filter Pills */}
            <ScrollView horizontal nestedScrollEnabled={true} showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayPillsScroll}>
              {DAYS.map((d) => {
                const isSel = selectedDay === d;
                const hasLecture = filterSlotsByDay(slots, d).length > 0;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setSelectedDay(d)}
                    style={[s.dayPill, isSel && s.dayPillSelected]}
                  >
                    <Text style={[s.dayPillText, isSel && s.dayPillTextSelected]}>
                      {d.slice(0, 3)}
                    </Text>
                    {hasLecture && (
                      <View style={[s.dayLectureDot, isSel && s.dayLectureDotSelected]} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* List of Periods for the selected day */}
            <View style={s.periodsListCol}>
              {STANDARD_PERIODS.map((item, index) => {
                if (item.isBreak || item.isLunch) {
                  return (
                    <View key={index} style={s.recessRow}>
                      <Clock size={13} color="#94A3B8" />
                      <Text style={s.recessText}>
                        {item.isBreak ? 'Morning Recess' : 'Lunch Break'} · {item.defaultTime}
                      </Text>
                    </View>
                  );
                }

                const matchedSlot = dynamicSlots.find((sl) => sl.period === item.periodNum);

                return (
                  <View
                    key={index}
                    style={[
                      s.periodCard,
                      matchedSlot ? s.periodCardActive : s.periodCardEmpty,
                    ]}
                  >
                    <View style={s.periodLeftMeta}>
                      <Text style={s.periodLabel}>{item.periodLabel}</Text>
                      <Text style={s.periodTime}>{matchedSlot?.time || item.defaultTime}</Text>
                    </View>

                    <View style={s.periodDivider} />

                    {matchedSlot ? (
                      <View style={s.periodContentCol}>
                        <View style={s.subjectBadgeRow}>
                          <View style={s.subjectGreenPill}>
                            <Text style={s.subjectGreenText}>{slotSubjectLabel(matchedSlot)}</Text>
                          </View>
                          <View style={s.classSectionTag}>
                            <Text style={s.classSectionText}>{slotClassLabel(matchedSlot)}</Text>
                          </View>
                        </View>
                        <View style={s.roomLocationRow}>
                          <MapPin size={12} color="#64748B" />
                          <Text style={s.roomLocationText}>{matchedSlot.classroom || 'Classroom'}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={s.noLectureCol}>
                        <Text style={s.noLectureText}>No lecture</Text>
                        <Text style={s.freePeriodSub}>Free instructional period</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* FULL WEEKLY MATRIX VIEW (DYNAMIC LIVE BACKEND MATRIX) */}
        {viewMode === 'matrix' && (
          <View>
            <View style={s.matrixHintRow}>
              <Text style={s.matrixHintText}>⇄ Swipe horizontally to explore all periods & breaks</Text>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              showsHorizontalScrollIndicator={true}
              style={s.matrixScroll}
              contentContainerStyle={{ paddingRight: 20 }}
            >
            <View style={s.matrixTable}>
              {/* Matrix Header Row */}
              <View style={s.matrixHeaderRow}>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 90 }]}>
                  <Text style={s.matrixHeaderText}>DAY / PERIOD</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 1</Text>
                  <Text style={s.matrixSubTime}>8:30 - 9:15 AM</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 2</Text>
                  <Text style={s.matrixSubTime}>9:15 - 10:00 AM</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, s.matrixBreakHeader, { width: 70 }]}>
                  <Text style={s.matrixBreakText}>BREAK</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 3</Text>
                  <Text style={s.matrixSubTime}>10:15 - 11:00 AM</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 4</Text>
                  <Text style={s.matrixSubTime}>11:00 - 11:45 AM</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, s.matrixBreakHeader, { width: 70 }]}>
                  <Text style={s.matrixBreakText}>LUNCH</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 5</Text>
                  <Text style={s.matrixSubTime}>12:30 - 1:15 PM</Text>
                </View>
                <View style={[s.matrixCell, s.matrixHeaderCell, { width: 115 }]}>
                  <Text style={s.matrixHeaderText}>PERIOD 6</Text>
                  <Text style={s.matrixSubTime}>1:15 - 2:00 PM</Text>
                </View>
              </View>

              {/* Matrix Rows: Monday through Friday */}
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                <View key={d} style={s.matrixRow}>
                  <View style={[s.matrixCell, s.matrixDayCell, { width: 90 }]}>
                    <Text style={s.matrixDayName}>{d}</Text>
                  </View>

                  {[1, 2].map((pNum) => {
                    const sl = (slots || []).find((s) => s.day === d && s.period === pNum);
                    return (
                      <View key={pNum} style={[s.matrixCell, { width: 115 }]}>
                        {sl ? (
                          <View style={s.activeSlotCard}>
                            <Text style={s.activeSlotSubject} numberOfLines={1}>{slotSubjectLabel(sl)}</Text>
                            <Text style={s.activeSlotClass} numberOfLines={1}>{slotClassLabel(sl)}</Text>
                            <Text style={s.activeSlotRoom} numberOfLines={1}>📍 {sl.classroom || 'Classroom'}</Text>
                          </View>
                        ) : (
                          <Text style={s.matrixEmptyText}>No lecture</Text>
                        )}
                      </View>
                    );
                  })}

                  {/* Break */}
                  <View style={[s.matrixCell, s.matrixBreakCol, { width: 70 }]}>
                    <Text style={s.matrixDash}>-</Text>
                  </View>

                  {[3, 4].map((pNum) => {
                    const sl = (slots || []).find((s) => s.day === d && s.period === pNum);
                    return (
                      <View key={pNum} style={[s.matrixCell, { width: 115 }]}>
                        {sl ? (
                          <View style={s.activeSlotCard}>
                            <Text style={s.activeSlotSubject} numberOfLines={1}>{slotSubjectLabel(sl)}</Text>
                            <Text style={s.activeSlotClass} numberOfLines={1}>{slotClassLabel(sl)}</Text>
                            <Text style={s.activeSlotRoom} numberOfLines={1}>📍 {sl.classroom || 'Classroom'}</Text>
                          </View>
                        ) : (
                          <Text style={s.matrixEmptyText}>No lecture</Text>
                        )}
                      </View>
                    );
                  })}

                  {/* Lunch */}
                  <View style={[s.matrixCell, s.matrixBreakCol, { width: 70 }]}>
                    <Text style={s.matrixDash}>-</Text>
                  </View>

                  {[5, 6].map((pNum) => {
                    const sl = (slots || []).find((s) => s.day === d && s.period === pNum);
                    return (
                      <View key={pNum} style={[s.matrixCell, { width: 115 }]}>
                        {sl ? (
                          <View style={s.activeSlotCard}>
                            <Text style={s.activeSlotSubject} numberOfLines={1}>{slotSubjectLabel(sl)}</Text>
                            <Text style={s.activeSlotClass} numberOfLines={1}>{slotClassLabel(sl)}</Text>
                            <Text style={s.activeSlotRoom} numberOfLines={1}>📍 {sl.classroom || 'Classroom'}</Text>
                          </View>
                        ) : (
                          <Text style={s.matrixEmptyText}>No lecture</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          </View>
        )}
      </Card>

      {/* 4. MY SUBJECTS CARD (MATCHING WEB PORTAL RIGHT WIDGET) */}
      <Card style={s.widgetCard}>
        <View style={s.widgetHeaderRow}>
          <BookOpen size={16} color="#1E6BFF" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.widgetTitle}>My Subjects</Text>
            <Text style={s.widgetSub}>
              Assigned subjects from Academic Setup. Green = published period exists.
            </Text>
          </View>
        </View>

        {visibleSubjects && visibleSubjects.length > 0 ? (
          visibleSubjects.map((sub: any, idx: number) => {
            const classesTaught = Array.from(
              new Set(
                slots
                  .filter((sl) => (sl.subjectName || (sl as any).subject) === sub.name || sl.subjectId === sub.id)
                  .map((sl) => slotClassLabel(sl))
                  .filter(Boolean)
              )
            );
            const scopeText = classesTaught.length > 0
              ? classesTaught.join(', ')
              : (sub.scopes?.join(', ') || 'All Assigned Classes');

            return (
              <View key={sub.id || idx} style={s.subjectCardItem}>
                <View style={s.subjectTitleRow}>
                  <Text style={s.subjectMainTitle}>{sub.name || 'Subject'}</Text>
                  <View style={s.publishedPill}>
                    <Text style={s.publishedPillText}>PUBLISHED</Text>
                  </View>
                </View>
                <Text style={s.subjectClassScope}>
                  {scopeText} ({classesTaught.length || 1} classes)
                </Text>
              </View>
            );
          })
        ) : slots.length > 0 ? (
          Array.from(new Set(slots.map((sl) => slotSubjectLabel(sl)))).map((subjName, idx) => {
            const classesTaught = Array.from(
              new Set(
                slots
                  .filter((sl) => slotSubjectLabel(sl) === subjName)
                  .map((sl) => slotClassLabel(sl))
                  .filter(Boolean)
              )
            );
            return (
              <View key={idx} style={s.subjectCardItem}>
                <View style={s.subjectTitleRow}>
                  <Text style={s.subjectMainTitle}>{subjName}</Text>
                  <View style={s.publishedPill}>
                    <Text style={s.publishedPillText}>PUBLISHED</Text>
                  </View>
                </View>
                <Text style={s.subjectClassScope}>
                  {classesTaught.join(', ') || 'Assigned'} ({classesTaught.length || 1} classes)
                </Text>
              </View>
            );
          })
        ) : (
          <View style={s.broadcastEmptyBox}>
            <Text style={s.broadcastEmptyText}>No subjects assigned yet.</Text>
            <Text style={s.broadcastSubText}>
              Subjects will appear once assigned in Academic Setup.
            </Text>
          </View>
        )}
      </Card>

      {/* 5. TIMETABLE BROADCASTS CARD (MATCHING WEB PORTAL NOTIFICATION CARD) */}
      <Card style={s.widgetCard}>
        <View style={s.widgetHeaderRow}>
          <View style={s.amberBellCircle}>
            <Bell size={16} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.widgetTitle}>Timetable Broadcasts</Text>
          </View>
        </View>
        <View style={s.broadcastEmptyBox}>
          <Text style={s.broadcastEmptyText}>No active timetable alerts.</Text>
          <Text style={s.broadcastSubText}>
            All periods operating as scheduled per the Academic Cycle 2026-27 master roster.
          </Text>
        </View>
      </Card>

      {/* 6. SCHOOL TIMING RULES CARD (EXACT 1-1 MATCH FROM SECOND SCREENSHOT) */}
      <Card style={s.widgetCard}>
        <View style={s.widgetHeaderRow}>
          <View style={s.purpleClockCircle}>
            <Clock size={16} color="#7C3AED" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.widgetTitle}>School Timing Rules</Text>
            <Text style={s.widgetSub}>Official hours of attendance & operations.</Text>
          </View>
        </View>

        {/* 5 Timing Rule Rows with perfect spacing */}
        <View style={s.rulesTable}>
          <View style={s.ruleRow}>
            <Text style={s.ruleLabel}>Class Starts</Text>
            <Text style={s.ruleValue}>08:30 AM</Text>
          </View>
          <View style={s.ruleRow}>
            <Text style={s.ruleLabel}>Duration/Period</Text>
            <Text style={s.ruleValue}>45 Mins</Text>
          </View>
          <View style={s.ruleRow}>
            <Text style={s.ruleLabel}>Morning Recess</Text>
            <Text style={s.ruleValue}>15 Mins</Text>
          </View>
          <View style={s.ruleRow}>
            <Text style={s.ruleLabel}>Lunch Hour</Text>
            <Text style={s.ruleValue}>45 Mins</Text>
          </View>
          <View style={[s.ruleRow, { borderBottomWidth: 0 }]}>
            <Text style={s.ruleLabel}>Weekly Classes</Text>
            <Text style={s.ruleValue}>5 Days</Text>
          </View>
        </View>

        {/* Footer Blue Lock Notice */}
        <View style={s.lockNoticeRow}>
          <Text style={s.lockNoticeText}>
            Attendance rosters lock 15 minutes after the first period bell.
          </Text>
        </View>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  col: {
    gap: 14,
  },

  /* Header Banner Card */
  headerBannerCard: {
    padding: 16,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  clockCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  pillRow: {
    marginBottom: 4,
  },
  purplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignSelf: 'flex-start',
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  purplePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bannerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  agendaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
  },
  agendaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  /* Timetable Card */
  timetableCard: {
    padding: 16,
  },
  timetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  teacherWiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherWiseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.4,
  },
  teacherWiseSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  miniPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniPrintText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  viewModeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewModeBtnActive: {
    backgroundColor: '#1E6BFF',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  dayPillsScroll: {
    gap: 6,
    marginBottom: 12,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: '#1E6BFF',
    borderColor: '#1E6BFF',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  dayPillTextSelected: {
    color: '#FFFFFF',
  },
  dayLectureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 3,
  },
  dayLectureDotSelected: {
    backgroundColor: '#FFFFFF',
  },

  periodsListCol: {
    gap: 8,
  },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  periodCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#86EFAC',
  },
  periodCardEmpty: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  periodLeftMeta: {
    width: 95,
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  periodTime: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  periodDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  periodContentCol: {
    flex: 1,
  },
  subjectBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectGreenPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  subjectGreenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  classSectionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classSectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  roomLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roomLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  noLectureCol: {
    flex: 1,
  },
  noLectureText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  freePeriodSub: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  recessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recessText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Matrix Table Styles */
  matrixHintRow: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  matrixHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  matrixScroll: {
    marginTop: 2,
  },
  matrixTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  matrixCell: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    minHeight: 56,
  },
  matrixHeaderCell: {
    minHeight: 48,
    backgroundColor: '#F8FAFC',
  },
  matrixHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
  },
  matrixSubTime: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  matrixBreakHeader: {
    backgroundColor: '#F1F5F9',
  },
  matrixBreakText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  matrixBreakCol: {
    backgroundColor: '#F8FAFC',
  },
  matrixDash: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  matrixDayCell: {
    backgroundColor: '#F8FAFC',
    borderRightColor: '#E2E8F0',
  },
  matrixDayName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeSlotCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    width: '95%',
  },
  activeSlotSubject: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  activeSlotClass: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  activeSlotRoom: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 1,
  },
  matrixEmptyText: {
    fontSize: 10,
    color: '#94A3B8',
  },

  /* My Subjects Card */
  widgetCard: {
    padding: 16,
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  widgetSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  subjectCardItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
  },
  subjectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  publishedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  publishedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  subjectClassScope: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  /* Timetable Broadcasts */
  amberBellCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastEmptyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  broadcastEmptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  broadcastSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },

  /* School Timing Rules */
  purpleClockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ruleLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  ruleValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  lockNoticeRow: {
    paddingVertical: 4,
  },
  lockNoticeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    lineHeight: 16,
  },
});
