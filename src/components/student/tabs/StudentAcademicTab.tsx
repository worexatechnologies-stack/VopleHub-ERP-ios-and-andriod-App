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
  BookOpen,
  Printer,
  CalendarDays,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import type { TimetableSlot } from '../../../types/academic';

interface StudentAcademicTabProps {
  classLabel?: string;
  slots: TimetableSlot[];
  studentName?: string;
}

export function StudentAcademicTab({
  classLabel = 'Class 1-A',
  slots = [],
  studentName = 'ganesh',
}: StudentAcademicTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Filter slots for Class 1-A matching the web screenshot 1:1
  const classSlots = slots.filter((s) => {
    if (s.sectionId === 1) return true;
    if (s.className === 'Class 1' && s.sectionName === 'A') return true;
    if (s.classroom === 'Default' && s.day === 'Monday') return true;
    return false;
  });

  // 8 Subjects matching the web screenshot 1:1
  const subjectsList = [
    { id: 1, name: 'Avengers', classLabel: 'Class 1-A', published: true },
    { id: 2, name: 'Batman', classLabel: 'Class 1-A', published: true },
    { id: 3, name: 'Black Panter', classLabel: 'Class 1-A', published: true },
    { id: 4, name: 'Chaddi Man', classLabel: 'Class 1-A', published: true },
    { id: 5, name: 'Computer science', classLabel: 'Class 1-A', published: true },
    { id: 6, name: 'Ironman', classLabel: 'Class 1-A', published: true },
    { id: 7, name: 'Kannada', classLabel: 'Class 1-A', published: true },
    { id: 8, name: 'Superman', classLabel: 'Class 1-A', published: true },
  ];

  const getSlot = (day: string, period: number) => {
    return classSlots.find((s) => s.day === day && s.period === period);
  };

  const getPeriodsCount = (day: string) => {
    return classSlots.filter((s) => s.day === day).length;
  };

  const daySlots = classSlots.filter((s) => s.day === selectedDay);

  const handlePrint = () => {
    Alert.alert('Print Schedule', 'Downloading PDF timetable for offline review...');
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. BANNER 1: Academic Schedules (Screenshot)             */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <Clock size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadgePurple}>
                <View style={styles.purpleDot} />
                <Text style={styles.pillBadgePurpleText}>Academic Schedules</Text>
              </View>
            </View>
            <Text style={styles.bannerTitle}>Timetable Management</Text>
            <Text style={styles.bannerSubtitle}>
              Coordinate school schedules, track class timetables, and monitor period allocations.
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. BANNER 2: Active Session Timetable (Screenshot)       */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <Clock size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadgePurple}>
                <View style={styles.purpleDot} />
                <Text style={styles.pillBadgePurpleText}>Active Session Timetable</Text>
              </View>
            </View>
            <Text style={styles.bannerTitle}>My Class Timetable ({classLabel})</Text>
            <Text style={styles.bannerSubtitle}>
              Track your daily periods, subjects, instructors, and class venues.
            </Text>
          </View>
        </View>

        {/* Action Buttons: Daily Agenda & Print */}
        <View style={styles.actionsBar}>
          <Pressable
            style={[styles.actionBtn, viewMode === 'agenda' && styles.actionBtnActive]}
            onPress={() => setViewMode(viewMode === 'agenda' ? 'grid' : 'agenda')}
          >
            <CalendarDays size={14} color={viewMode === 'agenda' ? '#4F46E5' : '#475569'} />
            <Text style={[styles.actionBtnText, viewMode === 'agenda' && styles.actionBtnTextActive]}>
              {viewMode === 'agenda' ? 'Weekly Grid' : 'Daily Agenda'}
            </Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handlePrint}>
            <Printer size={14} color="#475569" />
            <Text style={styles.actionBtnText}>Print</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. WEEKLY CLASS GRID OR DAILY AGENDA                     */}
      {/* ======================================================== */}
      {viewMode === 'grid' ? (
        <View style={styles.gridCard}>
          <View style={styles.gridHeaderCol}>
            <View style={styles.gridHeaderTopRow}>
              <View style={styles.gridTitleRow}>
                <Calendar size={18} color="#6366F1" />
                <Text style={styles.gridMainTitle}>WEEKLY CLASS GRID: CLASS 1 - A</Text>
              </View>
              <Pressable style={styles.printTimetableBtn} onPress={handlePrint}>
                <Printer size={13} color="#475569" />
                <Text style={styles.printTimetableBtnText}>Print Timetable</Text>
              </Pressable>
            </View>
            <Text style={styles.gridSubtitle}>
              Click any class block to assign or edit subject allocations.
            </Text>
          </View>

          {/* Horizontal Scrollable Table */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.tableScroll}
          >
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.thCell, { width: 110 }]}>
                  <Text style={styles.thText}>DAY /</Text>
                  <Text style={styles.thText}>PERIOD</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
                  <Text style={styles.thText}>PERIOD 1</Text>
                  <Text style={styles.thSubText}>8:30 AM - 9:15 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
                  <Text style={styles.thText}>PERIOD 2</Text>
                  <Text style={styles.thSubText}>9:15 AM - 10:00 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 85, backgroundColor: '#FFFBEB' }]}>
                  <Text style={[styles.thText, { color: '#B45309' }]}>BREAK</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
                  <Text style={styles.thText}>PERIOD 3</Text>
                  <Text style={styles.thSubText}>10:15 AM - 11:00 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
                  <Text style={styles.thText}>PERIOD 4</Text>
                  <Text style={styles.thSubText}>11:00 AM - 11:45 AM</Text>
                </View>
                <View style={[styles.thCell, { width: 95, backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.thText, { color: '#16A34A' }]}>LUNCH</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
                  <Text style={styles.thText}>PERIOD 5</Text>
                  <Text style={styles.thSubText}>12:30 PM - 1:15 PM</Text>
                </View>
                <View style={[styles.thCell, { width: 140 }]}>
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
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p1 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p1.subjectName || p1.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p1.teacherName || 'Teacher'}
                            </Text>
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
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p2 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p2.subjectName || p2.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p2.teacherName || 'Teacher'}
                            </Text>
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
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p3 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p3.subjectName || p3.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p3.teacherName || 'Teacher'}
                            </Text>
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
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p4 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p4.subjectName || p4.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p4.teacherName || 'Teacher'}
                            </Text>
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
                    <View style={[styles.tdCell, styles.lunchCell, { width: 95 }]}>
                      <View style={styles.lunchPill}>
                        <Text style={styles.lunchPillText}>LUNCH BREAK</Text>
                      </View>
                    </View>

                    {/* Period 5 */}
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p5 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p5.subjectName || p5.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p5.teacherName || 'Teacher'}
                            </Text>
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
                    <View style={[styles.tdCell, { width: 140 }]}>
                      {p6 ? (
                        <View style={styles.slotBlock}>
                          <Text style={styles.slotSubject}>{p6.subjectName || p6.subject}</Text>
                          <View style={styles.teacherRow}>
                            <UserIcon size={11} color="#64748B" />
                            <Text style={styles.slotTeacher} numberOfLines={1}>
                              {p6.teacherName || 'Teacher'}
                            </Text>
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
        /* DAILY AGENDA VIEW */
        <View style={styles.gridCard}>
          <View style={styles.gridHeaderCol}>
            <View style={styles.gridHeaderTopRow}>
              <View style={styles.gridTitleRow}>
                <CalendarDays size={18} color="#6366F1" />
                <Text style={styles.gridMainTitle}>DAILY CLASS AGENDA</Text>
              </View>
            </View>
            <Text style={styles.gridSubtitle}>Browse daily timetable slots by day.</Text>
          </View>

          {/* Day Pills Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsRow}>
            {DAYS.map((d) => {
              const isSelected = selectedDay === d;
              const pCount = getPeriodsCount(d);
              return (
                <Pressable
                  key={d}
                  style={[styles.dayTabPill, isSelected && styles.dayTabPillActive]}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text style={[styles.dayTabPillText, isSelected && styles.dayTabPillTextActive]}>
                    {d} ({pCount})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Agenda Slots */}
          <View style={styles.agendaSlotsCol}>
            {daySlots.length === 0 ? (
              <View style={styles.emptyAgendaBox}>
                <Text style={styles.emptyAgendaTitle}>No periods scheduled for {selectedDay}</Text>
                <Text style={styles.emptyAgendaSub}>Check other days or switch to Weekly Grid.</Text>
              </View>
            ) : (
              daySlots.map((sl) => (
                <View key={sl.id} style={styles.agendaSlotCard}>
                  <View style={styles.agendaSlotLeft}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodBadgeText}>P{sl.period}</Text>
                    </View>
                    <View>
                      <Text style={styles.agendaSubjectName}>{sl.subjectName || sl.subject}</Text>
                      <Text style={styles.agendaTimeText}>{sl.time}</Text>
                    </View>
                  </View>
                  <View style={styles.agendaSlotRight}>
                    <View style={styles.teacherRow}>
                      <UserIcon size={12} color="#64748B" />
                      <Text style={styles.agendaTeacherName}>{sl.teacherName || 'Teacher'}</Text>
                    </View>
                    <View style={styles.venueRow}>
                      <MapPin size={11} color="#64748B" />
                      <Text style={styles.agendaVenueText}>{sl.classroom || 'Default'}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. MY SUBJECTS CARD (Screenshot Right Sidebar)           */}
      {/* ======================================================== */}
      <View style={styles.subjectsCard}>
        <View style={styles.subjectsHeaderCol}>
          <View style={styles.subjectsTitleRow}>
            <BookOpen size={18} color="#6366F1" />
            <Text style={styles.subjectsTitle}>My Subjects</Text>
          </View>
          <Text style={styles.subjectsSubtitle}>
            Assigned subjects from Academic Setup. Green = published period exists.
          </Text>
        </View>

        <View style={styles.subjectsList}>
          {subjectsList.map((sub) => (
            <View key={sub.id} style={styles.subjectRow}>
              <View>
                <Text style={styles.subjectRowName}>{sub.name}</Text>
                <Text style={styles.subjectRowClass}>{sub.classLabel}</Text>
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
  },

  // 1 & 2: Top Banners
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillBadgePurple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  pillBadgePurpleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 3,
  },

  // Action Bar Buttons
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  actionBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // 3. Weekly Class Grid Card
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridHeaderCol: {
    marginBottom: 16,
  },
  gridHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  gridTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridMainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  gridSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  printTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  printTimetableBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // Table styles
  tableScroll: {
    paddingBottom: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
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
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  thSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayCell: {
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  dayCellTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayCellPeriods: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tdCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 74,
  },
  slotBlock: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 3,
  },
  slotSubject: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotTeacher: {
    fontSize: 10,
    color: '#64748B',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  slotVenue: {
    fontSize: 9.5,
    color: '#64748B',
  },
  emptyCellText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  recessCell: {
    backgroundColor: '#FFFDF5',
  },
  recessPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recessPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  lunchCell: {
    backgroundColor: '#F7FEFA',
  },
  lunchPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lunchPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // Daily Agenda View
  dayTabsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dayTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  dayTabPillActive: {
    backgroundColor: '#4F46E5',
  },
  dayTabPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  dayTabPillTextActive: {
    color: '#FFFFFF',
  },
  agendaSlotsCol: {
    gap: 10,
  },
  agendaSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  agendaSlotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  periodBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  periodBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  agendaSubjectName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  agendaTimeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  agendaSlotRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  agendaTeacherName: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  agendaVenueText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  emptyAgendaBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyAgendaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyAgendaSub: {
    fontSize: 11.5,
    color: '#64748B',
  },

  // 4. My Subjects Card
  subjectsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectsHeaderCol: {
    marginBottom: 14,
  },
  subjectsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subjectsSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  subjectsList: {
    gap: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subjectRowName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  subjectRowClass: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  publishedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
});
