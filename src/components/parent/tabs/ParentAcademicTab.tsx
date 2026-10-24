import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import {
  Clock,
  Calendar,
  BookOpen,
  Printer,
  CalendarDays,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import type { TimetableSlot } from '../../../types/academic';
import { resolveActiveWard } from '../../../utils';

interface ParentAcademicTabProps {
  wards: Student[];
  selectedWardId: number | 'all';
  onSelectWard: (id: number | 'all') => void;
  slots: TimetableSlot[];
  onOpenFullList?: () => void;
}

export function ParentAcademicTab({
  wards,
  selectedWardId,
  onSelectWard,
  slots,
}: ParentAcademicTabProps) {
  const activeWard: Student | undefined = resolveActiveWard(wards, selectedWardId);
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const wardClass = activeWard?.className || 'Class 1';
  const wardSec = activeWard?.sectionName || 'A';
  const wardName = activeWard?.name || 'ganesh';

  // Normalize class name display
  const classDisplay = wardClass.startsWith('Class')
    ? `${wardClass} - ${wardSec}`
    : `Class ${wardClass} - ${wardSec}`;

  // Filter slots for active ward's class & section
  const wardSlots = slots.filter((s) => {
    if (!activeWard) return false;
    if (s.sectionId && activeWard.sectionId && s.sectionId === activeWard.sectionId) return true;
    if (s.className && s.sectionName && s.className === activeWard.className && s.sectionName === activeWard.sectionName) return true;
    return false;
  });

  // Unique subjects for My Subjects panel
  const mySubjects = [
    { id: 10, name: 'Avengers', code: 'AVG', published: true },
    { id: 11, name: 'Batman', code: 'BTM', published: true },
    { id: 12, name: 'Black Panter', code: 'BKP', published: true },
    { id: 13, name: 'Chaddi Man', code: 'CDM', published: true },
    { id: 14, name: 'Computer science', code: 'CS', published: true },
    { id: 15, name: 'Ironman', code: 'IRM', published: true },
  ];

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getSlot = (day: string, period: number) => {
    return wardSlots.find((s) => s.day === day && s.period === period);
  };

  const getPeriodsCount = (day: string) => {
    return wardSlots.filter((s) => s.day === day).length;
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD: Timetable Management (Screenshot)    */}
      {/* ======================================================== */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Clock size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadgePurple}>
                <View style={styles.purpleDot} />
                <Text style={styles.pillBadgePurpleText}>Academic Schedules</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Timetable Management</Text>
            <Text style={styles.headerSubtitle}>
              Coordinate school schedules, track class timetables, and monitor period allocations.
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. SECOND CARD: Ward Timetable (Screenshot)              */}
      {/* ======================================================== */}
      <View style={styles.wardCard}>
        <View style={styles.wardTopRow}>
          <View style={styles.iconCircle}>
            <Clock size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadgePurple}>
                <View style={styles.purpleDot} />
                <Text style={styles.pillBadgePurpleText}>Active Session Timetable</Text>
              </View>
            </View>
            <Text style={styles.wardTitle}>Ward Timetable: {wardName}</Text>
            <Text style={styles.wardSubtitle}>
              Viewing official academic schedule for {wardName} ({classDisplay.replace(' - ', '-')}).
            </Text>
          </View>
        </View>

        {/* Action Buttons: Daily Agenda & Print + Ward Switcher */}
        <View style={styles.actionsBar}>
          <View style={styles.toggleButtonsRow}>
            <Pressable
              style={[styles.actionBtn, viewMode === 'agenda' && styles.actionBtnActive]}
              onPress={() => setViewMode(viewMode === 'agenda' ? 'grid' : 'agenda')}
            >
              <CalendarDays size={14} color={viewMode === 'agenda' ? '#4F46E5' : '#475569'} />
              <Text style={[styles.actionBtnText, viewMode === 'agenda' && styles.actionBtnTextActive]}>
                {viewMode === 'agenda' ? 'Weekly Grid' : 'Daily Agenda'}
              </Text>
            </Pressable>

            <Pressable style={styles.actionBtn}>
              <Printer size={14} color="#475569" />
              <Text style={styles.actionBtnText}>Print</Text>
            </Pressable>
          </View>

          {/* Multiple Wards Switcher */}
          {wards.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wardSwitcherRow}>
              {wards.map((w) => {
                const isSelected = w.id === activeWard?.id;
                return (
                  <Pressable
                    key={w.id}
                    style={[styles.wardPill, isSelected && styles.wardPillActive]}
                    onPress={() => onSelectWard(w.id)}
                  >
                    <GraduationCap size={13} color={isSelected ? '#4F46E5' : '#64748B'} />
                    <Text style={[styles.wardPillText, isSelected && styles.wardPillTextActive]}>
                      {w.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. WEEKLY CLASS GRID (Screenshot 1:1 Table)             */}
      {/* ======================================================== */}
      {viewMode === 'grid' ? (
        <View style={styles.gridCard}>
          <View style={styles.gridHeaderRow}>
            <View style={styles.gridHeaderLeft}>
              <Calendar size={18} color="#4F46E5" />
              <View>
                <Text style={styles.gridHeaderTitle}>
                  WEEKLY CLASS GRID: {classDisplay.toUpperCase()}
                </Text>
                <Text style={styles.gridHeaderSubtitle}>
                  Click any class block to assign or edit subject allocations.
                </Text>
              </View>
            </View>

            <Pressable style={styles.printTimetableBtn}>
              <Printer size={13} color="#475569" />
              <Text style={styles.printTimetableBtnText}>Print Timetable</Text>
            </Pressable>
          </View>

          {/* Table Container with Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.tableScroll}>
            <View style={styles.table}>
              {/* Table Header Row */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.thCell, { width: 110 }]}>
                  <Text style={styles.thText}>DAY / PERIOD</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 1</Text>
                  <Text style={styles.thSubText}>8:30 AM - 9:15 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 2</Text>
                  <Text style={styles.thSubText}>9:15 AM - 10:00 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 85, backgroundColor: '#FFFBEB' }]}>
                  <Text style={[styles.thText, { color: '#B45309' }]}>BREAK</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 3</Text>
                  <Text style={styles.thSubText}>10:15 AM - 11:00 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 4</Text>
                  <Text style={styles.thSubText}>11:00 AM - 11:45 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 85, backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.thText, { color: '#059669' }]}>LUNCH</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 5</Text>
                  <Text style={styles.thSubText}>12:30 PM - 1:15 PM</Text>
                </View>
                <View style={[styles.thCell, { width: 130 }]}>
                  <Text style={styles.thText}>PERIOD 6</Text>
                  <Text style={styles.thSubText}>1:15 PM - 2:00 PM</Text>
                </View>
              </View>

              {/* Table Day Rows */}
              {DAYS.map((day) => {
                const count = getPeriodsCount(day);
                const p1 = getSlot(day, 1);
                const p2 = getSlot(day, 2);
                const p3 = getSlot(day, 3);
                const p4 = getSlot(day, 4);
                const p5 = getSlot(day, 5);
                const p6 = getSlot(day, 6);

                return (
                  <View key={day} style={styles.tableRow}>
                    {/* Day Column */}
                    <View style={[styles.dayCell, { width: 110 }]}>
                      <Text style={styles.dayCellTitle}>{day}</Text>
                      <Text style={styles.dayCellPeriods}>{count} PERIODS</Text>
                    </View>

                    {/* Period 1 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p1 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p1.subjectName || p1.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p1.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p1.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>

                    {/* Period 2 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p2 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p2.subjectName || p2.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p2.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p2.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>

                    {/* Break / Recess Column */}
                    <View style={[styles.tdCell, styles.recessCell, { width: 85 }]}>
                      <View style={styles.recessPill}>
                        <Text style={styles.recessPillText}>RECESS</Text>
                      </View>
                    </View>

                    {/* Period 3 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p3 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p3.subjectName || p3.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p3.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p3.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>

                    {/* Period 4 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p4 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p4.subjectName || p4.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p4.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p4.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>

                    {/* Lunch Break Column */}
                    <View style={[styles.tdCell, styles.lunchCell, { width: 85 }]}>
                      <View style={styles.lunchPill}>
                        <Text style={styles.lunchPillText}>LUNCH</Text>
                        <Text style={styles.lunchPillText}>BREAK</Text>
                      </View>
                    </View>

                    {/* Period 5 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p5 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p5.subjectName || p5.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p5.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p5.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>

                    {/* Period 6 */}
                    <View style={[styles.tdCell, { width: 130 }]}>
                      {p6 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p6.subjectName || p6.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>{p6.teacherName || 'Teacher'}</Text>
                          </View>
                          <View style={styles.venueRow}>
                            <MapPin size={10} color="#64748B" />
                            <Text style={styles.slotVenue}>{p6.classroom || 'Default'}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>- Empty -</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Agenda View (Alternative Daily Mode) */
        <View style={styles.gridCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agendaDaySelector}>
            {DAYS.map((d) => (
              <Pressable
                key={d}
                style={[styles.agendaDayPill, selectedDay === d && styles.agendaDayPillActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.agendaDayText, selectedDay === d && styles.agendaDayTextActive]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.agendaList}>
            {wardSlots
              .filter((s) => s.day === selectedDay)
              .sort((a, b) => a.period - b.period)
              .map((sl) => (
                <View key={sl.id} style={styles.agendaItem}>
                  <View style={styles.agendaPeriodBadge}>
                    <Text style={styles.agendaPeriodBadgeText}>P{sl.period}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.agendaSubject}>{sl.subjectName || sl.subject}</Text>
                    <Text style={styles.agendaMeta}>
                      {sl.time} • {sl.teacherName} • Room {sl.classroom}
                    </Text>
                  </View>
                  <View style={styles.publishedPill}>
                    <Text style={styles.publishedPillText}>PUBLISHED</Text>
                  </View>
                </View>
              ))}

            {wardSlots.filter((s) => s.day === selectedDay).length === 0 && (
              <View style={styles.emptyAgendaBox}>
                <Text style={styles.emptyAgendaText}>No scheduled classes on {selectedDay}.</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. MY SUBJECTS CARD (Right sidebar card in screenshot)   */}
      {/* ======================================================== */}
      <View style={styles.mySubjectsCard}>
        <View style={styles.mySubjectsHeader}>
          <View style={styles.bookOutlineBox}>
            <BookOpen size={18} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mySubjectsTitle}>My Subjects</Text>
            <Text style={styles.mySubjectsSubtitle}>
              Assigned subjects from Academic Setup. Green = published period exists.
            </Text>
          </View>
        </View>

        <View style={styles.subjectsList}>
          {mySubjects.map((sub) => (
            <View key={sub.id} style={styles.subjectItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectItemName}>{sub.name}</Text>
                <Text style={styles.subjectItemClass}>{classDisplay}</Text>
              </View>
              <View style={styles.publishedBadge}>
                <Text style={styles.publishedBadgeText}>PUBLISHED</Text>
              </View>
            </View>
          ))}
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
  // 1. Header Card
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillBadgePurple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  purpleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6366F1',
  },
  pillBadgePurpleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.2,
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
    marginTop: 3,
  },

  // 2. Ward Card
  wardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  wardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  wardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  wardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  actionsBar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 10,
  },
  toggleButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  actionBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  actionBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  wardSwitcherRow: {
    flexDirection: 'row',
    gap: 6,
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

  // 3. Weekly Class Grid Card
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
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
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 220,
  },
  gridHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  gridHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  printTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  printTimetableBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableScroll: {
    paddingVertical: 4,
  },
  table: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  thText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    textAlign: 'center',
  },
  thSubText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dayCell: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  dayCellTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  dayCellPeriods: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 3,
  },
  tdCell: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    minHeight: 74,
  },
  slotBlock: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 7,
    width: '100%',
    gap: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  slotSubject: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4338CA',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotTeacher: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotVenue: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCellText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  recessCell: {
    backgroundColor: '#FFFBEB',
  },
  recessPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FEF3C7',
  },
  recessPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  lunchCell: {
    backgroundColor: '#F0FDF4',
  },
  lunchPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
  },
  lunchPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  // Agenda View Styles
  agendaDaySelector: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  agendaDayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  agendaDayPillActive: {
    backgroundColor: '#4F46E5',
  },
  agendaDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  agendaDayTextActive: {
    color: '#FFFFFF',
  },
  agendaList: {
    gap: 8,
    marginTop: 8,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  agendaPeriodBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaPeriodBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4F46E5',
  },
  agendaSubject: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  agendaMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  publishedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  publishedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  emptyAgendaBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyAgendaText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },

  // 4. My Subjects Card
  mySubjectsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
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
  mySubjectsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bookOutlineBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  mySubjectsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  mySubjectsSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  subjectsList: {
    gap: 8,
  },
  subjectItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  subjectItemClass: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  publishedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  publishedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
});
