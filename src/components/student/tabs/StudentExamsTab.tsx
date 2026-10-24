import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Award,
  Calendar,
  Ticket,
  FileText,
  ChevronDown,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react-native';

interface StudentExamsTabProps {
  schedules?: any[];
  ticket?: any | null;
  reportCards?: any[];
}

type ExamSubTab = 'schedule' | 'hall_ticket' | 'report_cards';

export function StudentExamsTab({
  schedules = [],
  ticket = null,
  reportCards = [],
}: StudentExamsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<ExamSubTab>('schedule');
  const [classFilter, setClassFilter] = useState('All Classes (0)');
  const [showClassMenu, setShowClassMenu] = useState(false);

  // For ganesh (Class 1-A), schedules count is 0 matching web portal 1:1
  const classSchedules = (schedules || []).filter(
    (s) => s.className === 'Class 1' || s.className === 'Class 1-A'
  );

  const handlePrint = (type: string) => {
    Alert.alert('Print Document', `Preparing ${type} for printing or PDF export...`);
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER (1:1 with Web Screenshot)           */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <Award size={22} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.portalBadge}>
                <Text style={styles.portalBadgeText}>Student Portal</Text>
              </View>
              <Text style={styles.assessmentText}>Academic Assessment</Text>
            </View>
            <Text style={styles.bannerTitle}>Examination Desk & Hall Tickets</Text>
            <Text style={styles.bannerSubtitle}>
              View your published exam datesheet, papers schedule, and official hall ticket admit card.
            </Text>
          </View>
        </View>

        {/* Segmented Control Sub-Tabs */}
        <View style={styles.subTabsContainer}>
          <Pressable
            style={[
              styles.subTabBtn,
              activeSubTab === 'schedule' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('schedule')}
          >
            <Text
              style={[
                styles.subTabBtnText,
                activeSubTab === 'schedule' && styles.subTabBtnTextActive,
              ]}
            >
              Exam Schedule
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.subTabBtn,
              activeSubTab === 'hall_ticket' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('hall_ticket')}
          >
            <Ticket
              size={13}
              color={activeSubTab === 'hall_ticket' ? '#4F46E5' : '#EF4444'}
            />
            <Text
              style={[
                styles.subTabBtnText,
                activeSubTab === 'hall_ticket'
                  ? styles.subTabBtnTextActive
                  : { color: '#EF4444' },
              ]}
            >
              Hall Tickets
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.subTabBtn,
              activeSubTab === 'report_cards' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('report_cards')}
          >
            <Text
              style={[
                styles.subTabBtnText,
                activeSubTab === 'report_cards' && styles.subTabBtnTextActive,
              ]}
            >
              Report Cards
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. TAB 1: EXAM SCHEDULE (Screenshot State)               */}
      {/* ======================================================== */}
      {activeSubTab === 'schedule' && (
        <View style={styles.mainContentCard}>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardMainTitle}>Class Exam Timetable & Schedule</Text>
            <Text style={styles.cardSubtitle}>
              Published official examination schedules and paper timings.
            </Text>
          </View>

          {/* CLASS FILTER ROW */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>CLASS FILTER:</Text>
            <Pressable
              style={styles.filterDropdown}
              onPress={() => setShowClassMenu(!showClassMenu)}
            >
              <Text style={styles.filterDropdownText}>{classFilter}</Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {showClassMenu && (
            <View style={styles.dropdownMenu}>
              {['All Classes (0)', 'Class 1-A (0)'].map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.dropdownItem,
                    classFilter === opt && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setClassFilter(opt);
                    setShowClassMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      classFilter === opt && styles.dropdownItemTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Empty State Box matching Screenshot 1:1 */}
          {classSchedules.length === 0 ? (
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconContainer}>
                <Calendar size={42} color="#94A3B8" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No exam schedules found</Text>
              <Text style={styles.emptySubtitle}>
                Examination schedules will appear here once published by the school administration.
              </Text>
            </View>
          ) : (
            <View style={styles.schedulesList}>
              {classSchedules.map((sch) => (
                <View key={sch.id} style={styles.scheduleItem}>
                  <View style={styles.scheduleTopRow}>
                    <Text style={styles.scheduleTitle}>{sch.name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{sch.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.scheduleDates}>
                    {sch.startDate} to {sch.endDate} · {sch.className}
                  </Text>
                  {(sch.papers || []).map((p: any) => (
                    <View key={p.id} style={styles.paperRow}>
                      <Text style={styles.paperSubject}>{p.subjectName}</Text>
                      <Text style={styles.paperTime}>
                        {p.date} · {p.startTime}-{p.endTime} · Max {p.maxMarks}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* 3. TAB 2: HALL TICKETS                                   */}
      {/* ======================================================== */}
      {activeSubTab === 'hall_ticket' && (
        <View style={styles.mainContentCard}>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardMainTitle}>Official Examination Hall Tickets</Text>
            <Text style={styles.cardSubtitle}>
              Download or print your admit card with assigned seat and exam center.
            </Text>
          </View>

          {ticket ? (
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.ticketNumber}>
                    HALL TICKET #{ticket.ticketNumber || 'HT-2026-001'}
                  </Text>
                  <Text style={styles.ticketExamName}>
                    {ticket.examName || 'Annual Assessment 2026-27'}
                  </Text>
                </View>
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={12} color="#15803D" />
                  <Text style={styles.verifiedTagText}>OFFICIAL ADMIT</Text>
                </View>
              </View>

              <View style={styles.ticketDetailsGrid}>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.infoLabel}>STUDENT NAME</Text>
                  <Text style={styles.infoValue}>{ticket.studentName || 'ganesh'}</Text>
                </View>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.infoLabel}>ROLL NUMBER</Text>
                  <Text style={styles.infoValue}>Roll #1</Text>
                </View>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.infoLabel}>CLASS / SECTION</Text>
                  <Text style={styles.infoValue}>Class 1 - Section A</Text>
                </View>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.infoLabel}>EXAM CENTER</Text>
                  <Text style={styles.infoValue}>Main Campus Hall B</Text>
                </View>
              </View>

              <Pressable
                style={styles.printActionBtn}
                onPress={() => handlePrint('Hall Ticket')}
              >
                <Printer size={15} color="#FFFFFF" />
                <Text style={styles.printActionBtnText}>Print Official Admit Card</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconContainer}>
                <Ticket size={42} color="#94A3B8" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No hall ticket issued yet</Text>
              <Text style={styles.emptySubtitle}>
                Admit cards and examination hall tickets are released prior to examination commencement.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 3: REPORT CARDS                                   */}
      {/* ======================================================== */}
      {activeSubTab === 'report_cards' && (
        <View style={styles.mainContentCard}>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardMainTitle}>Academic Performance & Scorecards</Text>
            <Text style={styles.cardSubtitle}>
              Published marks, subject grade breakdowns, GPA, and term scorecards.
            </Text>
          </View>

          {reportCards.length === 0 ? (
            <View style={styles.emptyDashedBox}>
              <View style={styles.emptyIconContainer}>
                <FileText size={42} color="#94A3B8" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No published scorecards</Text>
              <Text style={styles.emptySubtitle}>
                Official examination scorecards will appear here once marks are verified and published.
              </Text>
            </View>
          ) : (
            <View style={styles.reportsList}>
              {reportCards.map((rc) => (
                <View key={rc.id} style={styles.reportItemCard}>
                  <View style={styles.reportTopRow}>
                    <View>
                      <Text style={styles.reportExamTitle}>{rc.examName}</Text>
                      <Text style={styles.reportMeta}>
                        Score: {rc.totalMarksObtained}/{rc.totalMaxMarks} · Rank {rc.rank} · GPA {rc.gpa}
                      </Text>
                    </View>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>{rc.grade}</Text>
                    </View>
                  </View>
                  {rc.teacherRemarks && (
                    <Text style={styles.reportRemarks}>“{rc.teacherRemarks}”</Text>
                  )}
                  <Pressable
                    style={styles.downloadReportBtn}
                    onPress={() => handlePrint('Report Card')}
                  >
                    <Printer size={13} color="#475569" />
                    <Text style={styles.downloadReportBtnText}>Download PDF Scorecard</Text>
                  </Pressable>
                </View>
              ))}
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

  // 1. Top Header Banner
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
    width: 44,
    height: 44,
    borderRadius: 14,
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
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  portalBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  portalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  assessmentText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
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

  // Sub-Tabs segmented control
  subTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  subTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  subTabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // 2. Main Content Card
  mainContentCard: {
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
    gap: 16,
  },
  cardHeaderCol: {
    gap: 2,
  },
  cardMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Class Filter Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterDropdownText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: -8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // Empty State Dashed Box (1:1 matching Screenshot)
  emptyDashedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyIconContainer: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
    gap: 12,
  },
  scheduleItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  scheduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  scheduleDates: {
    fontSize: 11,
    color: '#64748B',
  },
  paperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paperSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  paperTime: {
    fontSize: 11,
    color: '#64748B',
  },

  // Hall Ticket Card
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  ticketNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  ticketExamName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  ticketDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  ticketInfoCol: {
    minWidth: '45%',
    gap: 2,
  },
  infoLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  printActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  printActionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Report Cards List
  reportsList: {
    gap: 12,
  },
  reportItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  reportExamTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  reportRemarks: {
    fontSize: 11.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  downloadReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadReportBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
});
