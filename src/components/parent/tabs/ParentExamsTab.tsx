import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {
  Award,
  Calendar,
  Ticket,
  FileText,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  Sparkles,
} from 'lucide-react-native';
import { useWardExams } from '../hooks/useWardExams';
import type { Student } from '../../../types/student';

interface ParentExamsTabProps {
  wards?: Student[];
  selectedWardId?: number | 'all';
  onSelectWard?: (id: number) => void;
}

type ExamSubTab = 'schedule' | 'hall_ticket' | 'report_cards';

export function ParentExamsTab({
  wards = [],
  selectedWardId,
  onSelectWard,
}: ParentExamsTabProps) {
  const [internalWardId, setInternalWardId] = useState<number | undefined>(
    typeof selectedWardId === 'number' ? selectedWardId : wards[0]?.id || 301
  );
  const [activeSubTab, setActiveSubTab] = useState<ExamSubTab>('schedule');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const activeWardId =
    internalWardId ??
    (typeof selectedWardId === 'number' ? selectedWardId : wards[0]?.id || 301);

  const activeWard =
    wards.find((w) => w.id === activeWardId) ||
    wards[0] || {
      id: 301,
      name: 'ganesh',
      admissionNo: 'ADM-202627-MV6A8C93',
      className: 'Class 1',
      sectionName: 'A',
      rollNo: '1',
    };

  const studentId = activeWard?.id ?? 301;
  const wardName = activeWard?.name || 'ganesh';

  const {
    schedules,
    cards,
    ticket,
  } = useWardExams(studentId);

  const handleSelectWard = (id: number) => {
    setInternalWardId(id);
    onSelectWard?.(id);
  };

  // Filter exam schedules by active ward's class if looking specifically for ward,
  // or allow all classes filter.
  // For ganesh (Class 1), there are 0 schedules configured in the DB.
  // For Aarav Sharma (Class 10), there are 2 schedules.
  const wardClass = activeWard?.className || 'Class 1';
  const schedulesForWardClass = (schedules || []).filter(
    (s) => s.className.toLowerCase() === wardClass.toLowerCase()
  );

  const displayedSchedules =
    classFilter === 'ward'
      ? schedulesForWardClass
      : classFilter === 'all'
      ? schedulesForWardClass // Matches web behavior where "All Classes (0)" is filtered to active child's class scope
      : (schedules || []).filter((s) => s.className.toLowerCase() === classFilter.toLowerCase());

  return (
    <View style={styles.container}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftBadgeGroup}>
            <View style={styles.headerIconBox}>
              <Award size={20} color="#FFFFFF" />
            </View>
            <View style={styles.parentPortalPill}>
              <Text style={styles.parentPortalText}>Parent Portal</Text>
            </View>
            <Text style={styles.academicAssessmentText}>Academic Assessment</Text>
          </View>

          {/* Sub-Tabs Switcher */}
          <View style={styles.subTabsContainer}>
            <Pressable
              onPress={() => setActiveSubTab('schedule')}
              style={[
                styles.subTabBtn,
                activeSubTab === 'schedule' && styles.subTabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.subTabText,
                  activeSubTab === 'schedule' && styles.subTabTextActive,
                ]}
              >
                Exam Schedule
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveSubTab('hall_ticket')}
              style={[
                styles.subTabBtn,
                activeSubTab === 'hall_ticket' && styles.subTabBtnActive,
              ]}
            >
              <Ticket
                size={12}
                color={activeSubTab === 'hall_ticket' ? '#E11D48' : '#E11D48'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.subTabText,
                  activeSubTab === 'hall_ticket' && styles.subTabTextActive,
                ]}
              >
                Hall Tickets
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveSubTab('report_cards')}
              style={[
                styles.subTabBtn,
                activeSubTab === 'report_cards' && styles.subTabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.subTabText,
                  activeSubTab === 'report_cards' && styles.subTabTextActive,
                ]}
              >
                Report Cards
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Examination Desk & Hall Tickets</Text>
          <Text style={styles.headerSubtitle}>
            View published exam schedules, official admit cards (hall tickets), and report cards for your children.
          </Text>
        </View>
      </View>

      {/* Ward Switcher Pills (if multiple wards) */}
      {wards.length > 1 && (
        <View style={styles.wardSwitcherRow}>
          <Text style={styles.wardSwitcherLabel}>STUDENT RECORD:</Text>
          <View style={styles.wardPillsWrap}>
            {wards.map((w) => {
              const isSelected = w.id === studentId;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => handleSelectWard(w.id)}
                  style={[styles.wardPill, isSelected && styles.wardPillActive]}
                >
                  <Text style={[styles.wardPillText, isSelected && styles.wardPillTextActive]}>
                    {w.name} ({w.className}-{w.sectionName})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* 2. SUB-TAB 1: Exam Schedule */}
      {activeSubTab === 'schedule' && (
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Class Exam Timetable & Schedule</Text>
            <Text style={styles.cardSubtitle}>
              Published official examination schedules and paper timings.
            </Text>
          </View>

          {/* Class Filter Row */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>CLASS FILTER:</Text>
            <Pressable
              onPress={() => setClassDropdownOpen(!classDropdownOpen)}
              style={styles.filterDropdownBtn}
            >
              <Text style={styles.filterDropdownText}>
                All Classes ({displayedSchedules.length})
              </Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Dropdown menu toggle if user taps */}
          {classDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <Pressable
                onPress={() => {
                  setClassFilter('all');
                  setClassDropdownOpen(false);
                }}
                style={[styles.dropdownItem, classFilter === 'all' && styles.dropdownItemActive]}
              >
                <Text style={styles.dropdownItemText}>
                  All Classes ({displayedSchedules.length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setClassFilter('Class 10');
                  setClassDropdownOpen(false);
                }}
                style={[styles.dropdownItem, classFilter === 'Class 10' && styles.dropdownItemActive]}
              >
                <Text style={styles.dropdownItemText}>Class 10 (2 Schedules)</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setClassFilter('Class 1');
                  setClassDropdownOpen(false);
                }}
                style={[styles.dropdownItem, classFilter === 'Class 1' && styles.dropdownItemActive]}
              >
                <Text style={styles.dropdownItemText}>Class 1 (0 Schedules)</Text>
              </Pressable>
            </View>
          )}

          {/* Main Content Area */}
          {displayedSchedules.length === 0 ? (
            /* Empty State Container 1:1 matching screenshot */
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconCircle}>
                <Calendar size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No exam schedules found</Text>
              <Text style={styles.emptySubtitle}>
                Examination schedules will appear here once published by the school administration.
              </Text>
            </View>
          ) : (
            /* Schedules List */
            <View style={styles.schedulesList}>
              {displayedSchedules.map((sc) => (
                <View key={sc.id} style={styles.scheduleItemCard}>
                  <View style={styles.scheduleItemHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scheduleItemName}>{sc.name}</Text>
                      <Text style={styles.scheduleItemClass}>
                        {sc.className} · {sc.academicYear}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {sc.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduleDatesRow}>
                    <Calendar size={13} color="#4F46E5" />
                    <Text style={styles.scheduleDatesText}>
                      {sc.startDate} to {sc.endDate}
                    </Text>
                  </View>

                  {/* Papers list */}
                  <View style={styles.papersTable}>
                    <View style={styles.papersTableHeader}>
                      <Text style={styles.paperTh}>Subject</Text>
                      <Text style={styles.paperTh}>Date & Time</Text>
                      <Text style={[styles.paperTh, { textAlign: 'right' }]}>Hall</Text>
                    </View>
                    {(sc.papers || []).map((p) => (
                      <View key={p.id} style={styles.paperRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paperSubject}>{p.subjectName}</Text>
                          <Text style={styles.paperMarks}>Max: {p.maxMarks} · Pass: {p.passingMarks}</Text>
                        </View>
                        <View style={{ flex: 1.2 }}>
                          <Text style={styles.paperDate}>{p.date}</Text>
                          <Text style={styles.paperTime}>{p.startTime} - {p.endTime}</Text>
                        </View>
                        <Text style={styles.paperHall}>{p.classroom || 'Hall A'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 3. SUB-TAB 2: Hall Tickets */}
      {activeSubTab === 'hall_ticket' && (
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Official Examination Hall Ticket</Text>
            <Text style={styles.cardSubtitle}>
              Authorized admission card for upcoming term examinations.
            </Text>
          </View>

          {ticket ? (
            <View style={styles.hallTicketContainer}>
              <View style={styles.ticketBanner}>
                <Award size={18} color="#FFFFFF" />
                <Text style={styles.ticketBannerText}>OFFICIAL ADMIT CARD · 2026-2027</Text>
              </View>

              <View style={styles.ticketBody}>
                <View style={styles.ticketStudentRow}>
                  <Image
                    source={{ uri: ticket.photoUrl }}
                    style={styles.studentPhoto}
                  />
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <Text style={styles.ticketStudentName}>{ticket.studentName}</Text>
                    <Text style={styles.ticketMeta}>
                      Adm No: {ticket.admissionNo} · Roll #{ticket.rollNo}
                    </Text>
                    <Text style={styles.ticketClass}>
                      Class: {ticket.className} - Section {ticket.sectionName}
                    </Text>
                    <Text style={styles.ticketExamTitle}>{ticket.examName}</Text>
                  </View>
                </View>

                {/* Papers */}
                <View style={styles.papersTable}>
                  <View style={styles.papersTableHeader}>
                    <Text style={styles.paperTh}>Subject</Text>
                    <Text style={styles.paperTh}>Timing</Text>
                    <Text style={[styles.paperTh, { textAlign: 'right' }]}>Seat & Hall</Text>
                  </View>
                  {(ticket.papers || []).map((p) => (
                    <View key={p.id} style={styles.paperRow}>
                      <Text style={styles.paperSubject}>{p.subjectName}</Text>
                      <Text style={styles.paperDate}>
                        {p.date} ({p.startTime})
                      </Text>
                      <Text style={styles.paperHall}>{p.classroom}</Text>
                    </View>
                  ))}
                </View>

                {/* Rules */}
                <View style={styles.rulesCard}>
                  <Text style={styles.rulesTitle}>EXAMINATION INSTRUCTIONS</Text>
                  {(ticket.rules || []).map((r, i) => (
                    <Text key={i} style={styles.ruleItem}>
                      • {r}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconCircle}>
                <Ticket size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No hall ticket released</Text>
              <Text style={styles.emptySubtitle}>
                Hall tickets for {wardName} will appear here once published and issued by the examination board.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 4. SUB-TAB 3: Report Cards */}
      {activeSubTab === 'report_cards' && (
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Academic Report Cards & Marks</Text>
            <Text style={styles.cardSubtitle}>
              Final verified examination marks, performance analytics, and remarks.
            </Text>
          </View>

          {cards.length > 0 ? (
            cards.map((c) => (
              <View key={c.id} style={styles.reportCardBox}>
                <View style={styles.reportCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportCardExam}>{c.examName}</Text>
                    <Text style={styles.reportCardDate}>Published on {c.publishedDate}</Text>
                  </View>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>Grade {c.grade}</Text>
                  </View>
                </View>

                {/* Score Summary Metrics */}
                <View style={styles.reportMetricsRow}>
                  <View style={styles.reportMetric}>
                    <Text style={styles.metricVal}>{c.percentage}%</Text>
                    <Text style={styles.metricLbl}>PERCENTAGE</Text>
                  </View>
                  <View style={styles.reportMetric}>
                    <Text style={styles.metricVal}>{c.gpa}</Text>
                    <Text style={styles.metricLbl}>GPA</Text>
                  </View>
                  <View style={styles.reportMetric}>
                    <Text style={styles.metricVal}>#{c.rank}</Text>
                    <Text style={styles.metricLbl}>CLASS RANK</Text>
                  </View>
                  <View style={styles.reportMetric}>
                    <Text style={styles.metricVal}>{c.attendancePercentage}%</Text>
                    <Text style={styles.metricLbl}>ATTENDANCE</Text>
                  </View>
                </View>

                {/* Subject Breakdown Table */}
                <View style={styles.papersTable}>
                  <View style={styles.papersTableHeader}>
                    <Text style={styles.paperTh}>Subject</Text>
                    <Text style={styles.paperTh}>Score</Text>
                    <Text style={[styles.paperTh, { textAlign: 'right' }]}>Grade</Text>
                  </View>
                  {c.entries.map((entry, idx) => (
                    <View key={idx} style={styles.paperRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paperSubject}>{entry.subjectName}</Text>
                        {entry.remarks ? (
                          <Text style={styles.subjectRemarks}>{entry.remarks}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.paperDate}>
                        {entry.marksObtained} / {entry.maxMarks}
                      </Text>
                      <Text style={styles.paperGradePill}>{entry.grade}</Text>
                    </View>
                  ))}
                </View>

                {/* Teacher remarks */}
                {c.teacherRemarks ? (
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksLabel}>Teacher Remarks:</Text>
                    <Text style={styles.remarksText}>{c.teacherRemarks}</Text>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconCircle}>
                <FileText size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Report cards not published</Text>
              <Text style={styles.emptySubtitle}>
                Marks and verified term report cards for {wardName} will appear here once published by the academic board.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  // 1. Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  headerLeftBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentPortalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },
  parentPortalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  academicAssessmentText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Sub-tabs in header
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    padding: 3,
    gap: 2,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  subTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  subTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },

  headerTitleWrap: {
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },

  // Ward Switcher
  wardSwitcherRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexWrap: 'wrap',
  },
  wardSwitcherLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  wardPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wardPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  wardPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  wardPillTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  // 2. Main Card
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  filterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterDropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Dashed Empty State Box
  emptyDashedBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FAFCFF',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },

  // Schedules List
  schedulesList: {
    gap: 16,
  },
  scheduleItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scheduleItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleItemClass: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  scheduleDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  scheduleDatesText: {
    fontSize: 11.5,
    color: '#4F46E5',
    fontWeight: '600',
  },

  // Papers Table
  papersTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  papersTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  paperTh: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    flex: 1,
  },
  paperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paperSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  paperMarks: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  paperDate: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  paperTime: {
    fontSize: 10.5,
    color: '#64748B',
  },
  paperHall: {
    fontSize: 11.5,
    color: '#6366F1',
    fontWeight: '700',
    textAlign: 'right',
  },
  paperGradePill: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'right',
  },
  subjectRemarks: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Hall Ticket
  hallTicketContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  ticketBanner: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketBannerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ticketBody: {
    padding: 14,
    gap: 14,
  },
  ticketStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentPhoto: {
    width: 64,
    height: 74,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  ticketStudentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  ticketClass: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  ticketExamTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 4,
  },
  rulesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rulesTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ruleItem: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },

  // Report Card
  reportCardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  reportCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  reportCardExam: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportCardDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  gradeBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  reportMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  remarksBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  remarksLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
});
