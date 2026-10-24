import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground } from 'react-native';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  CheckSquare,
  FileCheck2,
  AlertCircle,
  BookOpen,
} from 'lucide-react-native';
import { Card, CardTitle, CardSubtitle, EmptyState, DaySelector } from '../../common';
import { useGreeting } from '../../../hooks/useResponsive';
import { filterSlotsByDay, slotSubjectLabel } from '../../../utils';
import type { TimetableSlot, Subject } from '../../../types/academic';
import type { Student } from '../../../types/student';
import type { Teacher } from '../../../types/teacher';
import type { ExamSchedule } from '../../../types/exams';

export type TeacherHomeNav =
  | 'attendance'
  | 'academic'
  | 'student'
  | 'exams'
  | 'salary-details'
  | 'teacher-documents'
  | 'communication';

export function TeacherHomeTab({
  userName,
  slots = [],
  visibleSubjects = [],
  students = [],
  teachers = [],
  leaveRequests = [],
  exams = [],
  salaries = [],
  notifs = [],
  teacherProfile,
  selectedDay,
  onSelectDay,
  onNavigate,
}: {
  userName: string;
  slots?: TimetableSlot[];
  visibleSubjects?: Subject[];
  students?: Student[];
  teachers?: Teacher[];
  leaveRequests?: any[];
  exams?: ExamSchedule[];
  salaries?: any[];
  notifs?: any[];
  teacherProfile?: Teacher | null;
  selectedDay: string;
  onSelectDay: (d: string) => void;
  onNavigate: (t: TeacherHomeNav) => void;
}) {
  const greeting = useGreeting(userName);
  const daySlots = filterSlotsByDay(slots, selectedDay);

  const attendanceDisplay = useMemo(() => {
    const withAttendance = students.filter(
      (s) => typeof s.attendancePercentage === 'number' && s.attendancePercentage > 0
    );
    if (withAttendance.length > 0) {
      const avg =
        withAttendance.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) /
        withAttendance.length;
      return `${Math.round(avg)}%`;
    }
    return 'Ready';
  }, [students]);

  return (
    <View style={s.col}>
      {/* 1. HERO CAMPUS BANNER (Matching Reference Screen 1) */}
      <View style={s.heroContainer}>
        <ImageBackground
          source={require('../../../assets/volpe_bg.jpg')}
          style={s.heroBg}
          imageStyle={s.heroImage}
        >
          <View style={s.heroOverlay}>
            <Text style={s.heroEyebrow}>ACADEMIC YEAR 2026 - 2027</Text>
            <Text style={s.heroGreeting}>{greeting}</Text>
            <Text style={s.heroTagline}>
              Together we inspire, educate and build brighter minds.
            </Text>

            {/* Academic Year Quick Chip */}
            <View style={s.academicChipRow}>
              <View style={s.academicChip}>
                <Calendar size={14} color="#1E6BFF" />
                <Text style={s.academicChipText}>Academic Year 2026 - 2027</Text>
              </View>
              <Pressable
                onPress={() => onNavigate('academic')}
                style={s.viewCalendarBtn}
              >
                <Text style={s.viewCalendarText}>View Calendar →</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 2. 2x2 METRIC CARDS (Dynamic from live backend data) */}
      <View style={s.statsContainer}>
        <View style={s.statsRow}>
          {/* Metric 1: Students */}
          <Pressable
            onPress={() => onNavigate('student')}
            style={s.statCard}
          >
            <View style={[s.statIconBox, { backgroundColor: '#EBF2FF' }]}>
              <Users size={20} color="#1E6BFF" />
            </View>
            <Text style={s.statValue}>{students.length > 0 ? students.length.toLocaleString() : '0'}</Text>
            <Text style={s.statLabel}>Students</Text>
            <View style={s.trendRow}>
              <Text style={s.trendText}>
                {students.length > 0 ? `${students.length} Enrolled in School` : 'Student Directory'}
              </Text>
            </View>
          </Pressable>

          {/* Metric 2: Teachers */}
          <Pressable
            onPress={() => onNavigate('academic')}
            style={s.statCard}
          >
            <View style={[s.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <GraduationCap size={20} color="#8B5CF6" />
            </View>
            <Text style={s.statValue}>{teachers.length > 0 ? teachers.length.toLocaleString() : '1'}</Text>
            <Text style={s.statLabel}>Teachers</Text>
            <Text style={s.statSub}>
              {teachers.length > 0 ? `${teachers.length} Active Staff` : 'Faculty Profile'}
            </Text>
          </Pressable>
        </View>

        <View style={s.statsRow}>
          {/* Metric 3: Attendance */}
          <Pressable
            onPress={() => onNavigate('attendance')}
            style={s.statCard}
          >
            <View style={[s.statIconBox, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={20} color="#16A34A" />
            </View>
            <Text style={s.statValue}>{attendanceDisplay}</Text>
            <Text style={s.statLabel}>Attendance Today</Text>
            <View style={s.trendRow}>
              <Text style={s.trendText}>
                {attendanceDisplay === 'Ready' ? 'Mark Class Register' : 'Average Attendance'}
              </Text>
            </View>
          </Pressable>

          {/* Metric 4: Assigned Classes / Subjects */}
          <Pressable
            onPress={() => onNavigate('academic')}
            style={s.statCard}
          >
            <View style={[s.statIconBox, { backgroundColor: '#FFEDD5' }]}>
              <BookOpen size={20} color="#F97316" />
            </View>
            <Text style={s.statValue}>{visibleSubjects.length || slots.length || 0}</Text>
            <Text style={s.statLabel}>My Subjects</Text>
            <Text style={s.statSub}>
              {slots.length > 0 ? `${slots.length} Weekly Period(s)` : 'Assigned Classes'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. TODAY'S HIGHLIGHTS (Dynamic from live backend data) */}
      <Card style={s.highlightsCard}>
        <View style={s.highlightsHeader}>
          <Text style={s.highlightsTitle}>Today's Highlights</Text>
          <Pressable onPress={() => onNavigate('attendance')}>
            <Text style={s.viewAllLink}>View All</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => onNavigate('communication')}
          style={s.highlightItem}
        >
          <View style={[s.highlightIcon, { backgroundColor: '#FEF3C7' }]}>
            <FileCheck2 size={16} color="#D97706" />
          </View>
          <Text style={s.highlightText}>
            {leaveRequests.length > 0
              ? `${leaveRequests.filter((r: any) => r.status === 'Pending').length || leaveRequests.length} Leave request(s) on file`
              : 'Staff leave applications desk'}
          </Text>
          <ChevronRight size={16} color="#94A3B8" />
        </Pressable>

        <Pressable
          onPress={() => onNavigate('attendance')}
          style={s.highlightItem}
        >
          <View style={[s.highlightIcon, { backgroundColor: '#FEE2E2' }]}>
            <AlertCircle size={16} color="#EF4444" />
          </View>
          <Text style={s.highlightText}>
            {students.length > 0
              ? `Mark attendance for ${students.length} student(s)`
              : 'Daily attendance register ready'}
          </Text>
          <ChevronRight size={16} color="#94A3B8" />
        </Pressable>

        <Pressable
          onPress={() => onNavigate('exams')}
          style={[s.highlightItem, { borderBottomWidth: 0 }]}
        >
          <View style={[s.highlightIcon, { backgroundColor: '#EBF2FF' }]}>
            <Calendar size={16} color="#1E6BFF" />
          </View>
          <Text style={s.highlightText}>
            {exams.length > 0
              ? `${exams[0].name || 'Exam'} (${exams.length} scheduled)`
              : 'Academic examination schedules'}
          </Text>
          <ChevronRight size={16} color="#94A3B8" />
        </Pressable>
      </Card>

      {/* 4. TEACHING SCHEDULE WITH ROOM TAGS (Matching Reference Screen 3) */}
      <Card>
        <CardTitle>Teaching Schedule - {selectedDay}</CardTitle>
        <CardSubtitle>Assignment-gated periods and classrooms.</CardSubtitle>
        <DaySelector selectedDay={selectedDay} onSelectDay={onSelectDay} />

        {daySlots.length === 0 ? (
          <EmptyState
            title={`No periods on ${selectedDay}`}
            subtitle="Scheduled classes will appear here."
          />
        ) : (
          <View style={s.scheduleList}>
            {daySlots.map((sl) => {
              const room = sl.classroom || 'Classroom';
              return (
                <View key={sl.id} style={s.scheduleCard}>
                  <View style={s.periodBadge}>
                    <Text style={s.periodText}>P{sl.period}</Text>
                    <Text style={s.periodTime}>{sl.time ? sl.time.split('-')[0].trim() : ''}</Text>
                  </View>

                  <View style={s.scheduleDetails}>
                    <Text style={s.subjectTitle}>{slotSubjectLabel(sl)}</Text>
                    <Text style={s.classMeta}>
                      {sl.className ? `${sl.className} ${sl.sectionName ? 'Sec ' + sl.sectionName : ''}` : 'Class Session'} • {userName}
                    </Text>
                  </View>

                  <View style={s.roomBadge}>
                    <Text style={s.roomText}>{room}</Text>
                  </View>

                  <Pressable
                    onPress={() => onNavigate('attendance')}
                    style={s.takeAttendanceBtn}
                  >
                    <CheckSquare size={13} color="#1E6BFF" />
                    <Text style={s.takeAttendanceText}>Attendance</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },

  // Hero Campus Banner
  heroContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  heroBg: {
    width: '100%',
  },
  heroImage: {
    opacity: 0.28,
  },
  heroOverlay: {
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#93C5FD',
    marginBottom: 4,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroTagline: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
    lineHeight: 18,
  },
  academicChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  academicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  academicChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewCalendarBtn: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewCalendarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E6BFF',
  },

  // 2x2 Metric Cards Grid
  statsContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBF0F7',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  trendRow: {
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },

  // Highlights
  highlightsCard: {
    padding: 16,
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E6BFF',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  highlightIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  // Schedule list
  scheduleList: {
    gap: 8,
    marginTop: 8,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBF0F7',
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  periodBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E6BFF',
  },
  periodTime: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  scheduleDetails: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  classMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roomBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  takeAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  takeAttendanceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E6BFF',
  },
});

