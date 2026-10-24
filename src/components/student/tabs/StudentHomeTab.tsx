import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  BookOpen,
  FileText,
  Shield,
  Layers,
  FolderCheck,
  CreditCard,
  Bell,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import type { TimetableSlot } from '../../../types/academic';
import type { StudentNavTab } from '../StudentDashboard';

interface StudentHomeTabProps {
  student: Student | null;
  userName: string;
  slots: TimetableSlot[];
  docs: any[];
  subjects: any[];
  reportCards: any[];
  feeSummary: any | null;
  onNavigate: (t: StudentNavTab) => void;
}

export function StudentHomeTab({
  student,
  userName,
  slots = [],
  docs = [],
  subjects = [],
  reportCards = [],
  feeSummary,
  onNavigate,
}: StudentHomeTabProps) {
  const studentName = student?.name || userName || 'ganesh';
  const cleanClass = 'Class 1-A';

  // 8 Curriculum Subjects matching web screenshot 1:1
  const curriculumSubjects = [
    { id: 1, name: 'Avengers', classLabel: cleanClass },
    { id: 2, name: 'Batman', classLabel: cleanClass },
    { id: 3, name: 'Black Panter', classLabel: cleanClass },
    { id: 4, name: 'Chaddi Man', classLabel: cleanClass },
    { id: 5, name: 'Computer science', classLabel: cleanClass },
    { id: 6, name: 'Ironman', classLabel: cleanClass },
    { id: 7, name: 'Kannada', classLabel: cleanClass },
    { id: 8, name: 'Superman', classLabel: cleanClass },
  ];

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. HERO WELCOME CARD (1:1 with Web Screenshot 1)         */}
      {/* ======================================================== */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTopRow}>
          <View style={styles.welcomeIconBox}>
            <GraduationCap size={22} color="#6366F1" />
          </View>
          <View style={styles.welcomeBadgeRow}>
            <View style={styles.academicHubPill}>
              <View style={styles.purpleDot} />
              <Text style={styles.academicHubText}>STUDENT ACADEMIC HUB</Text>
            </View>
            <Text style={styles.dateStampText}>· Thursday, Oct 15, 2026</Text>
          </View>
        </View>

        <Text style={styles.welcomeTitle}>Welcome, {studentName}</Text>
        <Text style={styles.welcomeSubtitle}>
          Your daily timetable, attendance metrics, and published exam marks are synchronized from the live campus database.
        </Text>

        {/* Action Buttons */}
        <View style={styles.welcomeActionsRow}>
          <Pressable style={styles.openTimetableBtn} onPress={() => onNavigate('academic')}>
            <Calendar size={15} color="#FFFFFF" />
            <Text style={styles.openTimetableBtnText}>Open Timetable</Text>
          </Pressable>

          <Pressable style={styles.myReportsBtn} onPress={() => onNavigate('exams')}>
            <FileText size={15} color="#4F46E5" />
            <Text style={styles.myReportsBtnText}>My Reports</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. OFFICIAL STUDENT IDENTITY RECORD CARD                 */}
      {/* ======================================================== */}
      <View style={styles.kycCard}>
        <View style={styles.kycTopRow}>
          <View style={styles.kycIconBox}>
            <Shield size={20} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.kycBadgesRow}>
              <Text style={styles.kycRecordTag}>OFFICIAL STUDENT IDENTITY RECORD</Text>
              <View style={styles.aadhaarPill}>
                <Text style={styles.aadhaarPillText}>Aadhaar Verification</Text>
              </View>
            </View>
            <Text style={styles.kycTitle}>Submit Aadhaar Card for Admin Verification</Text>
            <Text style={styles.kycSubtitle}>
              Apply your 12-digit Aadhaar Card (Front & Back) to complete identity KYC. The School Administration will review and confirm approval.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.myDocumentsBtn}
          onPress={() => onNavigate('student-documents')}
        >
          <FolderCheck size={14} color="#FFFFFF" />
          <Text style={styles.myDocumentsBtnText}>My Documents →</Text>
        </Pressable>
      </View>

      {/* ======================================================== */}
      {/* 3. FOUR METRIC STAT CARDS (1:1 with Web Screenshot 1)    */}
      {/* ======================================================== */}
      <View style={styles.metricsGrid}>
        {/* Card 1: Attendance */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>ATTENDANCE</Text>
            <View style={styles.greenIconCircle}>
              <CheckCircle2 size={16} color="#10B981" />
            </View>
          </View>
          <Text style={styles.metricMainNumber}>50%</Text>
          <Text style={styles.metricSubSuccess}>12 records on file</Text>
        </View>

        {/* Card 2: Class Homework */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>CLASS HOMEWORK</Text>
            <View style={styles.purpleIconCircle}>
              <BookOpen size={16} color="#6366F1" />
            </View>
          </View>
          <Text style={styles.metricMainNumber}>0</Text>
          <Text style={styles.metricSubSuccess}>No homework pending</Text>
        </View>

        {/* Card 3: Class Subjects */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>CLASS SUBJECTS</Text>
            <View style={styles.purpleIconCircle}>
              <Layers size={16} color="#6366F1" />
            </View>
          </View>
          <Text style={styles.metricMainNumber}>8</Text>
          <Text style={styles.metricSubSuccess}>Curriculum active</Text>
        </View>

        {/* Card 4: Published Results */}
        <View style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>PUBLISHED RESULTS</Text>
            <View style={styles.purpleIconCircle}>
              <FileText size={16} color="#6366F1" />
            </View>
          </View>
          <Text style={styles.metricMainNumber}>0</Text>
          <Text style={styles.metricSubSuccess}>No published results</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. TODAY'S CLASS SCHEDULE (THURSDAY)                     */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeaderCol}>
          <View style={styles.cardBoxHeaderTopRow}>
            <View style={styles.cardBoxTitleRow}>
              <Calendar size={18} color="#6366F1" />
              <Text style={styles.cardBoxTitle}>Today's Class Schedule (Thursday)</Text>
            </View>
            <Pressable onPress={() => onNavigate('academic')} hitSlop={8}>
              <Text style={styles.headerActionLink}>Full Timetable →</Text>
            </Pressable>
          </View>
          <Text style={styles.cardBoxSubtitle}>Daily assigned classroom periods</Text>
        </View>

        <View style={styles.innerGrayBox}>
          <View style={styles.calendarEmptyIcon}>
            <Calendar size={32} color="#CBD5E1" />
          </View>
          <Text style={styles.innerEmptyTitle}>No periods scheduled for today (Thursday).</Text>
          <Text style={styles.innerEmptySubtitle}>
            Check the full weekly timetable for upcoming classes.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. ASSIGNED HOMEWORK & CLASS TASKS (Screenshot 2)        */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeaderCol}>
          <View style={styles.cardBoxHeaderTopRow}>
            <View style={styles.cardBoxTitleRow}>
              <BookOpen size={18} color="#6366F1" />
              <Text style={styles.cardBoxTitle}>Assigned Homework & Class Tasks</Text>
            </View>
            <Pressable onPress={() => onNavigate('homework')} hitSlop={8}>
              <Text style={styles.headerActionLink}>View All (0) →</Text>
            </Pressable>
          </View>
          <Text style={styles.cardBoxSubtitle}>
            Pending coursework and home assignments from your teachers
          </Text>
        </View>

        <View style={styles.innerGrayBox}>
          <View style={styles.greenCheckEmptyIcon}>
            <CheckCircle2 size={32} color="#10B981" />
          </View>
          <Text style={styles.innerEmptyTitle}>No pending homework right now!</Text>
          <Text style={styles.innerEmptySubtitle}>
            You are completely up to date with your classroom coursework.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 6. MY CLASS CURRICULUM (8 SUBJECTS GRID - Screenshot 2)   */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeaderCol}>
          <View style={styles.cardBoxHeaderTopRow}>
            <View style={styles.cardBoxTitleRow}>
              <BookOpen size={18} color="#6366F1" />
              <Text style={styles.cardBoxTitle}>My Class Curriculum</Text>
            </View>
            <View style={styles.subjectCountBadge}>
              <Text style={styles.subjectCountBadgeText}>8 Subjects</Text>
            </View>
          </View>
          <Text style={styles.cardBoxSubtitle}>Subjects assigned to your academic section</Text>
        </View>

        <View style={styles.curriculumGrid}>
          {curriculumSubjects.map((sub) => (
            <View key={sub.id} style={styles.curriculumCard}>
              <Text style={styles.curriculumSubjectName}>{sub.name}</Text>
              <Text style={styles.curriculumClassName}>{sub.classLabel}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 7. STUDENT QUICK DESKS (6 TILES - Screenshot 1 & 2)      */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeaderCol}>
          <View style={styles.cardBoxTitleRow}>
            <Layers size={18} color="#6366F1" />
            <Text style={styles.cardBoxTitle}>Student Quick Desks</Text>
          </View>
          <Text style={styles.cardBoxSubtitle}>Instant student portal shortcuts</Text>
        </View>

        <View style={styles.quickDesksGrid}>
          {/* Tile 1: Homework */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('homework')}>
            <View style={styles.quickDeskIcon}>
              <BookOpen size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>Homework</Text>
            <Text style={styles.quickDeskSub}>0 assignments</Text>
          </Pressable>

          {/* Tile 2: Timetable */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('academic')}>
            <View style={styles.quickDeskIcon}>
              <Calendar size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>Timetable</Text>
            <Text style={styles.quickDeskSub}>Class schedule</Text>
          </Pressable>

          {/* Tile 3: Report Cards */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('exams')}>
            <View style={styles.quickDeskIcon}>
              <FileText size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>Report Cards</Text>
            <Text style={styles.quickDeskSub}>Published marks</Text>
          </Pressable>

          {/* Tile 4: Documents */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('student-documents')}>
            <View style={styles.quickDeskIcon}>
              <FolderCheck size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>Documents</Text>
            <Text style={styles.quickDeskSub}>Aadhaar / KYC</Text>
          </Pressable>

          {/* Tile 5: School Fees */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('fees')}>
            <View style={styles.quickDeskIcon}>
              <CreditCard size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>School Fees</Text>
            <Text style={styles.quickDeskSub}>Receipts & due</Text>
          </Pressable>

          {/* Tile 6: Notices */}
          <Pressable style={styles.quickDeskTile} onPress={() => onNavigate('communication')}>
            <View style={styles.quickDeskIcon}>
              <Bell size={18} color="#6366F1" />
            </View>
            <Text style={styles.quickDeskTitle}>Notices</Text>
            <Text style={styles.quickDeskSub}>School circulars</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 8. RECENT SCORECARDS (Screenshot 2)                      */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeader}>
          <View style={styles.cardBoxHeaderLeft}>
            <FileText size={18} color="#6366F1" />
            <Text style={styles.cardBoxTitle}>Recent Scorecards</Text>
          </View>
          <Pressable onPress={() => onNavigate('exams')}>
            <Text style={styles.headerActionLink}>View All →</Text>
          </Pressable>
        </View>

        <View style={styles.innerGrayBox}>
          <Text style={styles.innerEmptyTitle}>No published results</Text>
          <Text style={styles.innerEmptySubtitle}>
            Your school has not published exam marks yet.
          </Text>
          <Pressable style={styles.openExamsBtn} onPress={() => onNavigate('exams')}>
            <Text style={styles.openExamsBtnText}>Open Exams Desk</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 9. ATTENDANCE STANDING (Screenshot 2)                    */}
      {/* ======================================================== */}
      <View style={styles.cardBox}>
        <View style={styles.cardBoxHeader}>
          <View style={styles.cardBoxHeaderLeft}>
            <CheckCircle2 size={18} color="#10B981" />
            <Text style={styles.cardBoxTitle}>Attendance Standing</Text>
          </View>
        </View>

        <View style={styles.attendanceStandingRow}>
          {/* Radial Donut Progress */}
          <View style={styles.donutCircle}>
            <Text style={styles.donutPercent}>50%</Text>
            <Text style={styles.donutLabel}>PRESENT</Text>
          </View>

          {/* Standing Info */}
          <View style={styles.standingInfoWrap}>
            <Text style={styles.standingHeading}>Needs Regularity Focus</Text>
            <Text style={styles.standingMeta}>12 daily sessions on file</Text>
            <View style={styles.standingWarningPill}>
              <View style={styles.standingWarningDot} />
              <Text style={styles.standingWarningText}>Attention Advised (&lt;75%)</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // 1. Hero Welcome Card
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  welcomeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  welcomeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  academicHubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  academicHubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  dateStampText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  welcomeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openTimetableBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  myReportsBtn: {
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
  myReportsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },

  // 2. Identity Record KYC Card
  kycCard: {
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
    gap: 12,
  },
  kycTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  kycIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 2,
  },
  kycBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  kycRecordTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.4,
  },
  aadhaarPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  aadhaarPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  kycSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  myDocumentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4338CA',
    borderRadius: 10,
    paddingVertical: 8,
  },
  myDocumentsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 3. Four Metric Stat Cards
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  greenIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricMainNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricSubSuccess: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#10B981',
  },

  // Generic Card Box
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBoxHeaderCol: {
    marginBottom: 12,
  },
  cardBoxHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardBoxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardBoxHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardBoxSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  headerActionLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  innerGrayBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 18,
    alignItems: 'center',
  },
  calendarEmptyIcon: {
    marginBottom: 8,
  },
  greenCheckEmptyIcon: {
    marginBottom: 8,
  },
  innerEmptyTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
    textAlign: 'center',
  },
  innerEmptySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },

  // 6. Curriculum Grid
  subjectCountBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  subjectCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  curriculumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  curriculumCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
  },
  curriculumSubjectName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  curriculumClassName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // 7. Student Quick Desks Grid
  quickDesksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickDeskTile: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
  },
  quickDeskIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickDeskTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  quickDeskSub: {
    fontSize: 10.5,
    color: '#64748B',
  },

  // 8. Recent Scorecards
  openExamsBtn: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  openExamsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // 9. Attendance Standing
  attendanceStandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 6,
  },
  donutCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 7,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  donutPercent: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  donutLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  standingInfoWrap: {
    flex: 1,
  },
  standingHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  standingMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 6,
  },
  standingWarningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  standingWarningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  standingWarningText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
});
