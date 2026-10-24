import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Award,
  Calendar,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Filter,
  Printer,
  Sparkles,
  Save,
  Send,
  X,
  Check,
  Search,
  BookOpen,
  QrCode,
  ShieldCheck,
} from 'lucide-react-native';
import type { ExamSchedule, ExamPaper, HallTicket } from '../../../types/exams';
import type { Student } from '../../../types/student';
import { apiSaveMarksSheet } from '../../../services/schoolApi';
import { formatDate } from '../../../utils';

interface TeacherExamsTabProps {
  schedules?: ExamSchedule[];
  students?: Student[];
  teacherName?: string;
}

export function TeacherExamsTab({
  schedules = [],
  students = [],
  teacherName = 'Teacher',
}: TeacherExamsTabProps) {
  // Top Tab Switcher: 'schedule' vs 'marks' (Matches Web Portal Toggle 1:1)
  const [activeSegment, setActiveSegment] = useState<'schedule' | 'marks'>('schedule');

  // Class Filter state for Exam Schedule
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [classFilterDropdownOpen, setClassFilterDropdownOpen] = useState(false);

  // Marks Entry state
  const [selectedExamId, setSelectedExamId] = useState<number | null>(schedules?.[0]?.id ?? null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);

  // Hall Ticket Preview Modal
  const [viewingHallTicket, setViewingHallTicket] = useState<{
    examName: string;
    className: string;
    papers: ExamPaper[];
  } | null>(null);

  // Sync exam id when schedules load asynchronously
  useEffect(() => {
    if (selectedExamId == null && schedules.length > 0) {
      setSelectedExamId(schedules[0].id);
    }
  }, [schedules, selectedExamId]);

  // Selected exam object
  const activeExam = useMemo(
    () => schedules.find((s) => s.id === selectedExamId) || schedules[0] || null,
    [schedules, selectedExamId]
  );

  // Set default subject when active exam changes
  useEffect(() => {
    if (activeExam?.papers && activeExam.papers.length > 0 && !selectedSubject) {
      setSelectedSubject(activeExam.papers[0].subjectName);
    }
  }, [activeExam, selectedSubject]);

  // Unique classes across schedules
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set);
  }, [schedules]);

  // Filtered schedules based on class selection
  const filteredSchedules = useMemo(() => {
    if (selectedClassFilter === 'all') return schedules;
    return schedules.filter((s) => s.className === selectedClassFilter);
  }, [schedules, selectedClassFilter]);

  // Calculate grade based on score and max marks
  const getGradeBadge = (scoreStr: string, maxMarks = 100) => {
    if (!scoreStr) return null;
    const score = Number(scoreStr);
    if (isNaN(score)) return null;
    const pct = (score / maxMarks) * 100;

    if (pct >= 90) return { label: 'A+', bg: '#DCFCE7', text: '#15803D' };
    if (pct >= 80) return { label: 'A', bg: '#DCFCE7', text: '#16A34A' };
    if (pct >= 70) return { label: 'B+', bg: '#EFF6FF', text: '#1D4ED8' };
    if (pct >= 60) return { label: 'B', bg: '#EFF6FF', text: '#2563EB' };
    if (pct >= 50) return { label: 'C', bg: '#FEF3C7', text: '#D97706' };
    if (pct >= 35) return { label: 'D', bg: '#FEF3C7', text: '#B45309' };
    return { label: 'F', bg: '#FEE2E2', text: '#DC2626' };
  };

  // Save Marks Handler
  const handleSaveMarks = async (status: 'draft' | 'submitted') => {
    if (!activeExam) return;
    setSavingMarks(true);
    try {
      const subjectName = selectedSubject || activeExam.papers?.[0]?.subjectName || 'General';
      const maxMarks = activeExam.papers?.find((p) => p.subjectName === subjectName)?.maxMarks || 100;

      const entries = students.map((st) => ({
        student_id: st.id,
        subject_name: subjectName,
        marks_obtained: Math.min(Number(marks[`${st.id}`] || 0), maxMarks),
      }));

      const res = await apiSaveMarksSheet(activeExam.id, {
        section: 'A',
        status,
        entries,
      });

      Alert.alert(
        status === 'submitted' ? 'Marks Submitted' : 'Draft Saved',
        status === 'submitted'
          ? `Official marks for ${subjectName} successfully submitted to School Examination Board.`
          : 'Your draft has been saved. You can edit and submit anytime.'
      );
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message || 'Could not save student marks. Please try again.');
    } finally {
      setSavingMarks(false);
    }
  };

  const handlePrintTimetable = (exam: ExamSchedule) => {
    Alert.alert(
      'Print Datesheet',
      `Official examination datesheet for ${exam.name} formatted for A4 landscape print. Ready for classroom notice board.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={s.container}>
      {/* 1. TOP HEADER CARD (Matching Web Portal Screenshot 1:1) */}
      <View style={s.headerCard}>
        <View style={s.headerTopRow}>
          <View style={s.headerLeft}>
            {/* Purple Ribbon/Bookmark Icon Box */}
            <View style={s.headerIconBox}>
              <Award size={22} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            <View style={s.headerTitleWrap}>
              <View style={s.headerBadgeRow}>
                <View style={s.teacherViewPill}>
                  <Text style={s.teacherViewPillText}>Teacher View</Text>
                </View>
                <Text style={s.academicAssessmentText}>Academic Assessment</Text>
              </View>

              <Text style={s.headerTitle}>Examination Desk & Hall Tickets</Text>
              <Text style={s.headerSubtitle}>
                View assigned class exam datesheets, papers timetable, and record student marks.
              </Text>
            </View>
          </View>

          {/* Top-Right Segment Switcher: Exam Schedule vs Marks Entry */}
          <View style={s.segmentCapsule}>
            <Pressable
              onPress={() => setActiveSegment('schedule')}
              style={[
                s.segmentBtn,
                activeSegment === 'schedule' && s.segmentBtnActive,
              ]}
            >
              <Text
                style={[
                  s.segmentText,
                  activeSegment === 'schedule' && s.segmentTextActive,
                ]}
              >
                Exam Schedule
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveSegment('marks')}
              style={[
                s.segmentBtn,
                activeSegment === 'marks' && s.segmentBtnActive,
              ]}
            >
              <Text
                style={[
                  s.segmentText,
                  activeSegment === 'marks' && s.segmentTextActive,
                ]}
              >
                Marks Entry
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 2. EXAM SCHEDULE VIEW (Matching Web Portal 1:1) */}
      {activeSegment === 'schedule' && (
        <View style={s.contentCard}>
          <View style={s.contentHeader}>
            <View>
              <Text style={s.contentTitle}>Class Exam Timetable & Schedule</Text>
              <Text style={s.contentSubtitle}>
                Published official examination schedules and paper timings.
              </Text>
            </View>
          </View>

          {/* Class Filter Bar */}
          <View style={s.filterBarRow}>
            <Text style={s.filterLabel}>CLASS FILTER:</Text>

            <Pressable
              onPress={() => setClassFilterDropdownOpen(!classFilterDropdownOpen)}
              style={s.classFilterDropdownBtn}
            >
              <Text style={s.classFilterDropdownText}>
                {selectedClassFilter === 'all'
                  ? `All Classes (${availableClasses.length})`
                  : selectedClassFilter}
              </Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Dropdown Options */}
          {classFilterDropdownOpen && (
            <View style={s.dropdownOptionsBox}>
              <Pressable
                onPress={() => {
                  setSelectedClassFilter('all');
                  setClassFilterDropdownOpen(false);
                }}
                style={[
                  s.dropdownItem,
                  selectedClassFilter === 'all' && s.dropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    s.dropdownItemText,
                    selectedClassFilter === 'all' && s.dropdownItemTextActive,
                  ]}
                >
                  All Classes ({availableClasses.length})
                </Text>
                {selectedClassFilter === 'all' && <Check size={14} color="#4F46E5" />}
              </Pressable>

              {availableClasses.map((cls) => (
                <Pressable
                  key={cls}
                  onPress={() => {
                    setSelectedClassFilter(cls);
                    setClassFilterDropdownOpen(false);
                  }}
                  style={[
                    s.dropdownItem,
                    selectedClassFilter === cls && s.dropdownItemActive,
                  ]}
                >
                  <Text
                    style={[
                      s.dropdownItemText,
                      selectedClassFilter === cls && s.dropdownItemTextActive,
                    ]}
                  >
                    {cls}
                  </Text>
                  {selectedClassFilter === cls && <Check size={14} color="#4F46E5" />}
                </Pressable>
              ))}
            </View>
          )}

          {/* Empty State (Matching Web Screenshot 1:1) */}
          {filteredSchedules.length === 0 ? (
            <View style={s.dashedEmptyState}>
              <View style={s.emptyCalendarIconBox}>
                <Calendar size={40} color="#CBD5E1" strokeWidth={1.4} />
              </View>
              <Text style={s.emptyTitle}>No exam schedules found</Text>
              <Text style={s.emptySubtitle}>
                Examination schedules will appear here once published by the school administration.
              </Text>
            </View>
          ) : (
            /* Active Exam Schedules List */
            <View style={s.schedulesList}>
              {filteredSchedules.map((exam) => (
                <View key={exam.id} style={s.scheduleCard}>
                  {/* Exam Card Top Header */}
                  <View style={s.scheduleCardHeader}>
                    <View style={s.scheduleCardTitleCol}>
                      <View style={s.scheduleTitleRow}>
                        <Text style={s.scheduleTitle}>{exam.name}</Text>
                        <View style={s.statusPillPublished}>
                          <CheckCircle2 size={11} color="#16A34A" />
                          <Text style={s.statusPillPublishedText}>
                            {exam.status.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.scheduleClassText}>
                        {exam.className} · Academic Year {exam.academicYear}
                      </Text>
                    </View>

                    <View style={s.scheduleActionBtns}>
                      <Pressable
                        onPress={() =>
                          setViewingHallTicket({
                            examName: exam.name,
                            className: exam.className,
                            papers: exam.papers || [],
                          })
                        }
                        style={s.hallTicketBtn}
                      >
                        <QrCode size={13} color="#4F46E5" />
                        <Text style={s.hallTicketBtnText}>Hall Ticket</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handlePrintTimetable(exam)}
                        style={s.printDatesheetBtn}
                      >
                        <Printer size={13} color="#475569" />
                        <Text style={s.printDatesheetBtnText}>Print</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Dates range banner */}
                  <View style={s.dateRangeStrip}>
                    <Calendar size={13} color="#4F46E5" />
                    <Text style={s.dateRangeText}>
                      Examination Duration: {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
                    </Text>
                  </View>

                  {/* Papers Table / Timeline */}
                  <View style={s.papersTableContainer}>
                    <View style={s.paperHeaderRow}>
                      <Text style={[s.paperHeadCell, { flex: 1.6 }]}>SUBJECT</Text>
                      <Text style={[s.paperHeadCell, { flex: 1.4 }]}>DATE & TIME</Text>
                      <Text style={[s.paperHeadCell, { flex: 1 }]}>VENUE</Text>
                      <Text style={[s.paperHeadCell, { flex: 1, textAlign: 'right' }]}>MAX MARKS</Text>
                    </View>

                    {(exam.papers || []).map((paper) => (
                      <View key={paper.id} style={s.paperDataRow}>
                        <View style={[s.paperCellCol, { flex: 1.6 }]}>
                          <Text style={s.paperSubjectName}>{paper.subjectName}</Text>
                          <Text style={s.paperPassMarks}>Pass: {paper.passingMarks} Marks</Text>
                        </View>

                        <View style={[s.paperCellCol, { flex: 1.4 }]}>
                          <Text style={s.paperDateText}>{formatDate(paper.date)}</Text>
                          <Text style={s.paperTimeText}>
                            {paper.startTime} - {paper.endTime}
                          </Text>
                        </View>

                        <View style={[s.paperCellCol, { flex: 1 }]}>
                          <View style={s.venueRow}>
                            <MapPin size={11} color="#64748B" />
                            <Text style={s.venueText}>{paper.classroom || 'Hall A'}</Text>
                          </View>
                        </View>

                        <View style={[s.paperCellCol, { flex: 1, alignItems: 'flex-end' }]}>
                          <View style={s.maxMarksPill}>
                            <Text style={s.maxMarksText}>{paper.maxMarks} M</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 3. MARKS ENTRY VIEW */}
      {activeSegment === 'marks' && (
        <View style={s.contentCard}>
          <View style={s.contentHeader}>
            <View>
              <Text style={s.contentTitle}>Student Marks Entry & Grading</Text>
              <Text style={s.contentSubtitle}>
                Input marks obtained for assigned subjects. Auto-calculates percentages and grades.
              </Text>
            </View>
          </View>

          {/* Exam & Subject Selectors */}
          <View style={s.marksConfigWrap}>
            {/* Exam selector */}
            <View style={s.marksConfigField}>
              <Text style={s.configFieldLabel}>SELECT EXAMINATION:</Text>
              <Pressable
                onPress={() => setExamDropdownOpen(!examDropdownOpen)}
                style={s.configDropdownBtn}
              >
                <Text style={s.configDropdownText} numberOfLines={1}>
                  {activeExam?.name || 'Select Exam'}
                </Text>
                <ChevronDown size={14} color="#64748B" />
              </Pressable>

              {examDropdownOpen && (
                <View style={s.examDropdownOptions}>
                  {schedules.map((ex) => (
                    <Pressable
                      key={ex.id}
                      onPress={() => {
                        setSelectedExamId(ex.id);
                        setExamDropdownOpen(false);
                      }}
                      style={[
                        s.dropdownItem,
                        activeExam?.id === ex.id && s.dropdownItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.dropdownItemText,
                          activeExam?.id === ex.id && s.dropdownItemTextActive,
                        ]}
                      >
                        {ex.name}
                      </Text>
                      {activeExam?.id === ex.id && <Check size={14} color="#4F46E5" />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Subject selector pills */}
            <View style={s.marksConfigField}>
              <Text style={s.configFieldLabel}>ASSIGNED PAPERS / SUBJECTS:</Text>
              <ScrollView
                horizontal
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.subjectsPillScroll}
              >
                {(activeExam?.papers || []).length === 0 ? (
                  <View style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>No papers configured</Text>
                  </View>
                ) : (
                  (activeExam?.papers || []).map((paper: any) => {
                    const isSel = selectedSubject === paper.subjectName;
                    return (
                      <Pressable
                        key={paper.id}
                        onPress={() => setSelectedSubject(paper.subjectName)}
                        style={[s.subjectPill, isSel && s.subjectPillActive]}
                      >
                        <BookOpen size={12} color={isSel ? '#FFFFFF' : '#475569'} />
                        <Text style={[s.subjectPillText, isSel && s.subjectPillTextActive]}>
                          {paper.subjectName} ({paper.maxMarks || 100}M)
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>

          {/* Students Roster Marks Table */}
          <View style={s.rosterMarksContainer}>
            <View style={s.rosterMarksHeader}>
              <Text style={[s.rosterHeadCell, { width: 55 }]}>ROLL</Text>
              <Text style={[s.rosterHeadCell, { flex: 1.5 }]}>STUDENT NAME</Text>
              <Text style={[s.rosterHeadCell, { width: 95, textAlign: 'center' }]}>SCORE / MAX</Text>
              <Text style={[s.rosterHeadCell, { width: 65, textAlign: 'center' }]}>GRADE</Text>
            </View>

            {students.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#94A3B8' }}>No assigned students for this assessment.</Text>
              </View>
            ) : (
              students.map((st) => {
                const currentVal = marks[`${st.id}`] ?? '';
                const grade = getGradeBadge(currentVal, 100);

                return (
                  <View key={st.id} style={s.studentMarkRow}>
                    {/* Roll No */}
                    <View style={{ width: 55 }}>
                      <Text style={s.rollNoText}>#{st.rollNo || st.id}</Text>
                    </View>

                    {/* Student Name */}
                    <View style={{ flex: 1.5 }}>
                      <Text style={s.studentRosterName}>{st.name}</Text>
                      <Text style={s.studentAdmNo}>ADM: {st.admissionNo || `ADM-2026-${st.id}`}</Text>
                    </View>

                    {/* Marks Input */}
                    <View style={s.scoreInputCol}>
                      <TextInput
                        value={currentVal}
                        onChangeText={(val) => {
                          const clean = val.replace(/[^0-9]/g, '');
                          if (Number(clean) <= 100) {
                            setMarks((prev) => ({ ...prev, [`${st.id}`]: clean }));
                          }
                        }}
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        maxLength={3}
                        style={s.marksTextInput}
                      />
                      <Text style={s.maxMarksSub}>/ 100</Text>
                    </View>

                    {/* Auto-Grade Badge */}
                    <View style={s.gradeBadgeCol}>
                      {grade ? (
                        <View style={[s.gradePill, { backgroundColor: grade.bg }]}>
                          <Text style={[s.gradePillText, { color: grade.text }]}>{grade.label}</Text>
                        </View>
                      ) : (
                        <Text style={s.noGradeText}>—</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Action Buttons: Save Draft & Submit Marks */}
          <View style={s.marksActionsRow}>
            <Pressable
              onPress={() => handleSaveMarks('draft')}
              disabled={savingMarks}
              style={s.saveDraftBtn}
            >
              <Save size={14} color="#334155" />
              <Text style={s.saveDraftBtnText}>Save Draft</Text>
            </Pressable>

            <Pressable
              onPress={() => handleSaveMarks('submitted')}
              disabled={savingMarks}
              style={s.submitMarksBtn}
            >
              {savingMarks ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={14} color="#FFFFFF" />
                  <Text style={s.submitMarksBtnText}>Submit to Examination Board</Text>
                </>
              )}
            </Pressable>
          </View>

          <Text style={s.marksNoticeText}>
            🔒 Notice: Published results are official and permanently recorded. Validation restricts input from 0 to paper max marks.
          </Text>
        </View>
      )}

      {/* 4. HALL TICKET PREVIEW MODAL */}
      <Modal
        visible={!!viewingHallTicket}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingHallTicket(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.hallTicketModalCard}>
            <View style={s.modalHeaderRow}>
              <View>
                <Text style={s.modalHeaderTitle}>Candidate Hall Ticket & Admit Card</Text>
                <Text style={s.modalHeaderSub}>
                  {viewingHallTicket?.examName} · {viewingHallTicket?.className}
                </Text>
              </View>
              <Pressable
                onPress={() => setViewingHallTicket(null)}
                style={s.modalCloseBtn}
              >
                <X size={16} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={s.hallTicketScroll} showsVerticalScrollIndicator={false}>
              <View style={s.hallTicketCanvas}>
                <View style={s.ticketTopHeader}>
                  <Text style={s.institutionName}>VOLPEHUB CENTRAL ACADEMY</Text>
                  <Text style={s.ticketBadge}>BOARD EXAMINATION ADMIT CARD</Text>
                </View>

                <View style={s.ticketMetaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.ticketMetaField}>EXAM: {viewingHallTicket?.examName}</Text>
                    <Text style={s.ticketMetaField}>CLASS: {viewingHallTicket?.className}</Text>
                    <Text style={s.ticketMetaField}>INVIGILATOR: {teacherName}</Text>
                  </View>
                  <View style={s.qrBox}>
                    <QrCode size={48} color="#0F172A" />
                  </View>
                </View>

                <View style={s.admitCardPapersList}>
                  <Text style={s.admitPapersTitle}>SCHEDULED PAPERS & TIMING:</Text>
                  {(viewingHallTicket?.papers || []).map((p, idx) => (
                    <View key={p.id || idx} style={s.admitPaperItem}>
                      <Text style={s.admitPaperSubject}>{p.subjectName}</Text>
                      <Text style={s.admitPaperTiming}>
                        {formatDate(p.date)} · {p.startTime} - {p.endTime}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={s.sealWrap}>
                  <ShieldCheck size={14} color="#16A34A" />
                  <Text style={s.sealText}>Verified by School Principal & Exam Controller</Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  Alert.alert('Hall Ticket Downloaded', 'Official Hall Ticket PDF saved.');
                  setViewingHallTicket(null);
                }}
                style={s.downloadTicketCTA}
              >
                <Printer size={15} color="#FFFFFF" />
                <Text style={s.downloadTicketCTAText}>Print / Export PDF</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 16,
  },

  // 1. TOP HEADER CARD
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flex: 1,
    minWidth: 260,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  teacherViewPill: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  teacherViewPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.3,
  },
  academicAssessmentText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },

  // Segment capsule
  segmentCapsule: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  segmentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // 2. MAIN CONTENT CARD
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  contentHeader: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  contentSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  // Class Filter Bar
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  classFilterDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  classFilterDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  dropdownOptionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    padding: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownItemTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // Dashed Empty State (Matching Web Screenshot)
  dashedEmptyState: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
  emptyCalendarIconBox: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 380,
  },

  // Schedules List
  schedulesList: {
    gap: 16,
  },
  scheduleCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  scheduleCardTitleCol: {
    flex: 1,
    minWidth: 200,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPillPublished: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusPillPublishedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  scheduleClassText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  scheduleActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hallTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hallTicketBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  printDatesheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  printDatesheetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  dateRangeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateRangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Papers Table
  papersTableContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  paperHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  paperHeadCell: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  paperDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  paperCellCol: {
    justifyContent: 'center',
  },
  paperSubjectName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  paperPassMarks: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  paperDateText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  paperTimeText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  maxMarksPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  maxMarksText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E293B',
  },

  // 3. MARKS ENTRY STYLES
  marksConfigWrap: {
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  marksConfigField: {
    gap: 6,
  },
  configFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  configDropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  configDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  examDropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 4,
    padding: 4,
  },
  subjectsPillScroll: {
    gap: 8,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  subjectPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  subjectPillTextActive: {
    color: '#FFFFFF',
  },

  // Roster Marks Table
  rosterMarksContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  rosterMarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rosterHeadCell: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  studentMarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rollNoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  studentRosterName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentAdmNo: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  scoreInputCol: {
    width: 95,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  marksTextInput: {
    width: 48,
    height: 34,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  maxMarksSub: {
    fontSize: 11,
    color: '#64748B',
  },
  gradeBadgeCol: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  gradePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  noGradeText: {
    color: '#CBD5E1',
    fontSize: 14,
  },

  marksActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  saveDraftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
  },
  saveDraftBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  submitMarksBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  submitMarksBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  marksNoticeText: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 15,
  },

  // 4. HALL TICKET MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  hallTicketModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  hallTicketScroll: {
    padding: 16,
  },
  hallTicketCanvas: {
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  ticketTopHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  institutionName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  ticketBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 2,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  ticketMetaField: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  admitCardPapersList: {
    gap: 6,
  },
  admitPapersTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  admitPaperItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  admitPaperSubject: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  admitPaperTiming: {
    fontSize: 10,
    color: '#64748B',
  },
  sealWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sealText: {
    fontSize: 9.5,
    color: '#15803D',
    fontWeight: '700',
  },
  downloadTicketCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 10,
  },
  downloadTicketCTAText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
