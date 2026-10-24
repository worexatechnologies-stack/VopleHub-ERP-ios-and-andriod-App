import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  GraduationCap,
  BookOpen,
  Search,
  Check,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react-native';
import { Card } from '../../common';
import type { Student } from '../../../types/student';

interface ClassMeta {
  id: string;
  name: string;
  number: number;
  sectionsCount: number;
  studentsCount: number;
  sections: {
    id: string;
    name: string;
    label: string;
    studentsCount: number;
  }[];
}

interface PeriodMeta {
  period: number;
  time: string;
  name: string;
}

const PERIODS: PeriodMeta[] = [
  { period: 1, time: '09:00', name: 'Period 1' },
  { period: 2, time: '09:45', name: 'Period 2' },
  { period: 3, time: '10:45', name: 'Period 3' },
  { period: 4, time: '11:30', name: 'Period 4' },
  { period: 5, time: '01:00', name: 'Period 5' },
  { period: 6, time: '01:45', name: 'Period 6' },
];

interface StudentAttendanceRecord {
  id: number;
  name: string;
  rollNo: string;
  admissionNo: string;
  periods: Record<number, 'Present' | 'Absent' | 'Late' | null>;
}

const BASELINE_STUDENTS: StudentAttendanceRecord[] = [];

export function TeacherAttendanceTab({
  students = [],
}: {
  students?: Student[];
}) {
  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const academicClasses = useMemo<ClassMeta[]>(() => {
    if (!students || students.length === 0) {
      return [];
    }
    const classMap = new Map<string, { sections: Set<string>; count: number }>();
    students.forEach((s) => {
      const cName = s.className || 'Class';
      const sName = s.sectionName || 'A';
      if (!classMap.has(cName)) {
        classMap.set(cName, { sections: new Set(), count: 0 });
      }
      const entry = classMap.get(cName)!;
      entry.sections.add(sName);
      entry.count++;
    });

    return Array.from(classMap.entries()).map(([cName, data], idx) => ({
      id: `class-${idx + 1}`,
      name: cName,
      number: idx + 1,
      sectionsCount: data.sections.size,
      studentsCount: data.count,
      sections: Array.from(data.sections).map((sName) => ({
        id: `${idx + 1}-${sName.toLowerCase()}`,
        name: sName,
        label: `Section ${sName}`,
        studentsCount: students.filter(
          (st) => (st.className || 'Class') === cName && (st.sectionName || 'A') === sName
        ).length,
      })),
    }));
  }, [students]);

  // Navigation Flow: 'classes' | 'sections' | 'register'
  const [viewMode, setViewMode] = useState<'classes' | 'sections' | 'register'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassMeta | null>(
    academicClasses[0] || null
  );
  const [selectedSection, setSelectedSection] = useState<{
    id: string;
    name: string;
    label: string;
    studentsCount: number;
  } | null>(academicClasses[0]?.sections[0] || null);

  React.useEffect(() => {
    if (!selectedClass && academicClasses.length > 0) {
      setSelectedClass(academicClasses[0]);
      setSelectedSection(academicClasses[0].sections[0] || null);
    }
  }, [academicClasses, selectedClass]);

  // Date Navigator State
  const [currentDate, setCurrentDate] = useState(getTodayFormatted);
  const [activePeriod, setActivePeriod] = useState<number>(1);

  // Dynamic Student Attendance Records State
  const dynamicRoster = useMemo<StudentAttendanceRecord[]>(() => {
    return (students || []).map((s) => ({
      id: s.id,
      name: s.name,
      rollNo: s.rollNo || '-',
      admissionNo: s.admissionNo || `ADM-${s.id}`,
      periods: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
    }));
  }, [students]);

  const [roster, setRoster] = useState<StudentAttendanceRecord[]>(dynamicRoster);

  React.useEffect(() => {
    setRoster(dynamicRoster);
  }, [dynamicRoster]);

  // Search and Filter Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<
    'all' | 'present' | 'absent' | 'late' | 'unmarked'
  >('all');

  // Handle Level Navigation
  const handleSelectClass = (cls: ClassMeta) => {
    setSelectedClass(cls);
    setSelectedSection(cls.sections[0]);
    setViewMode('sections');
  };

  const handleSelectSection = (sec: ClassMeta['sections'][0]) => {
    setSelectedSection(sec);
    setViewMode('register');
  };

  // Mark status for one student in active period
  const markStudentPeriod = (
    studentId: number,
    status: 'Present' | 'Absent' | 'Late'
  ) => {
    setRoster((prev) =>
      prev.map((st) => {
        if (st.id === studentId) {
          const current = st.periods[activePeriod];
          return {
            ...st,
            periods: {
              ...st.periods,
              [activePeriod]: current === status ? null : status,
            },
          };
        }
        return st;
      })
    );
  };

  // Mark student full day present (all 6 periods)
  const markStudentFullDay = (studentId: number) => {
    setRoster((prev) =>
      prev.map((st) => {
        if (st.id === studentId) {
          return {
            ...st,
            periods: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Present', 6: 'Present' },
          };
        }
        return st;
      })
    );
  };

  // Bulk Actions
  const handleMarkAllFullDayPresent = () => {
    setRoster((prev) =>
      prev.map((st) => ({
        ...st,
        periods: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Present', 6: 'Present' },
      }))
    );
    Alert.alert(
      'Full Day Attendance Marked',
      `All ${roster.length} students marked present for all 6 periods.`
    );
  };

  const handleMarkAllPeriodPresent = () => {
    setRoster((prev) =>
      prev.map((st) => ({
        ...st,
        periods: { ...st.periods, [activePeriod]: 'Present' },
      }))
    );
  };

  const handleMarkAllPeriodAbsent = () => {
    setRoster((prev) =>
      prev.map((st) => ({
        ...st,
        periods: { ...st.periods, [activePeriod]: 'Absent' },
      }))
    );
  };

  // Compute Period Stats for Timetable Strip
  const periodStats = useMemo(() => {
    const stats: Record<number, { present: number; absent: number }> = {};
    for (let p = 1; p <= 6; p++) {
      let pres = 0;
      let abs = 0;
      roster.forEach((st) => {
        if (st.periods[p] === 'Present') pres++;
        if (st.periods[p] === 'Absent') abs++;
      });
      stats[p] = { present: pres, absent: abs };
    }
    return stats;
  }, [roster]);

  // Compute Active Period Counts for Tabs
  const activePeriodCounts = useMemo(() => {
    let pres = 0;
    let abs = 0;
    let late = 0;
    let unmarked = 0;
    roster.forEach((st) => {
      const s = st.periods[activePeriod];
      if (s === 'Present') pres++;
      else if (s === 'Absent') abs++;
      else if (s === 'Late') late++;
      else unmarked++;
    });
    return {
      all: roster.length,
      present: pres,
      absent: abs,
      late,
      unmarked,
    };
  }, [roster, activePeriod]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter((st) => {
      // Tab filter
      const s = st.periods[activePeriod];
      if (filterTab === 'present' && s !== 'Present') return false;
      if (filterTab === 'absent' && s !== 'Absent') return false;
      if (filterTab === 'late' && s !== 'Late') return false;
      if (filterTab === 'unmarked' && s !== null) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          st.name.toLowerCase().includes(q) ||
          st.admissionNo.toLowerCase().includes(q) ||
          st.rollNo.includes(q)
        );
      }
      return true;
    });
  }, [roster, activePeriod, filterTab, searchQuery]);

  return (
    <View style={s.container}>
      {/* 1. TOP ATTENDANCE MANAGEMENT HEADER CARD (1:1 with Web Screenshot) */}
      <Card style={s.headerCard}>
        <View style={s.headerTopRow}>
          <View style={s.headerLeft}>
            {/* Violet rounded icon box */}
            <View style={s.headerIconWrap}>
              <Users size={22} color="#FFFFFF" />
            </View>

            <View style={s.headerTextWrap}>
              {/* Pill badge */}
              <View style={s.dailyPill}>
                <View style={s.dailyPillDot} />
                <Text style={s.dailyPillText}>Daily Attendance Register</Text>
              </View>

              <Text style={s.headerTitle}>Attendance Management</Text>
              <Text style={s.headerSubtitle}>
                Mark, track, and review daily student attendance across classes, sections, and periods.
              </Text>
            </View>
          </View>
        </View>

        {/* Date Navigator & Back Button Bar */}
        <View style={s.dateNavRow}>
          {viewMode !== 'classes' && (
            <Pressable
              onPress={() => {
                if (viewMode === 'register') setViewMode('sections');
                else if (viewMode === 'sections') setViewMode('classes');
              }}
              style={s.backBtn}
            >
              <ArrowLeft size={14} color="#334155" />
              <Text style={s.backBtnText}>Back</Text>
            </Pressable>
          )}

          <View style={s.datePickerPill}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                const parts = currentDate.split('-').map(Number);
                if (parts.length === 3) {
                  const d = new Date(parts[2], parts[1] - 1, parts[0]);
                  d.setDate(d.getDate() - 1);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  setCurrentDate(`${day}-${month}-${year}`);
                }
              }}
            >
              <ChevronLeft size={16} color="#64748B" />
            </Pressable>

            <Text style={s.datePickerText}>{currentDate}</Text>
            <Calendar size={14} color="#4F46E5" />

            <Pressable
              hitSlop={8}
              onPress={() => {
                const parts = currentDate.split('-').map(Number);
                if (parts.length === 3) {
                  const d = new Date(parts[2], parts[1] - 1, parts[0]);
                  d.setDate(d.getDate() + 1);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  setCurrentDate(`${day}-${month}-${year}`);
                }
              }}
            >
              <ChevronRight size={16} color="#64748B" />
            </Pressable>
          </View>
        </View>
      </Card>

      {/* 2. BREADCRUMB BAR (1:1 with Web Screenshot) */}
      <View style={s.breadcrumbCard}>
        <Pressable
          onPress={() => setViewMode('classes')}
          style={[
            s.breadcrumbItem,
            viewMode === 'classes' ? s.breadcrumbActive : s.breadcrumbInactive,
          ]}
        >
          <GraduationCap
            size={14}
            color={viewMode === 'classes' ? '#FFFFFF' : '#4F46E5'}
          />
          <Text
            style={[
              s.breadcrumbText,
              viewMode === 'classes'
                ? s.breadcrumbTextActive
                : s.breadcrumbTextInactive,
            ]}
          >
            All Classes
          </Text>
        </Pressable>

        {viewMode !== 'classes' && (
          <>
            <ChevronRight size={13} color="#94A3B8" />
            <Pressable
              onPress={() => setViewMode('sections')}
              style={[
                s.breadcrumbItem,
                viewMode === 'sections'
                  ? s.breadcrumbActive
                  : s.breadcrumbInactive,
              ]}
            >
              <BookOpen
                size={13}
                color={viewMode === 'sections' ? '#FFFFFF' : '#4F46E5'}
              />
              <Text
                style={[
                  s.breadcrumbText,
                  viewMode === 'sections'
                    ? s.breadcrumbTextActive
                    : s.breadcrumbTextInactive,
                ]}
              >
                {selectedClass?.name || 'Class'}
              </Text>
            </Pressable>
          </>
        )}

        {viewMode === 'register' && (
          <>
            <ChevronRight size={13} color="#94A3B8" />
            <View style={[s.breadcrumbItem, s.breadcrumbActive]}>
              <Users size={13} color="#FFFFFF" />
              <Text style={[s.breadcrumbText, s.breadcrumbTextActive]}>
                {selectedSection?.label || 'Section'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 3. VIEW 1: SELECT AN ACADEMIC CLASS */}
      {viewMode === 'classes' && (
        <View style={s.classesView}>
          <View style={s.sectionHeaderRow}>
            <View>
              <Text style={s.sectionTitle}>Select an Academic Class</Text>
              <Text style={s.sectionSub}>
                Choose a class to view its sections, daily timetable, and attendance records.
              </Text>
            </View>
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>
                {academicClasses.length} Classes Available
              </Text>
            </View>
          </View>

          {academicClasses.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Users size={36} color="#CBD5E1" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 10 }}>No Classes Available</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>No student records are currently assigned to your register.</Text>
            </View>
          ) : (
            <View style={s.classesGrid}>
              {academicClasses.map((cls) => (
                <Card key={cls.id} style={s.classCard}>
                  <View style={s.classCardTop}>
                    {/* Number Circle Badge */}
                    <View style={s.classNumCircle}>
                      <Text style={s.classNumText}>{cls.number}</Text>
                    </View>
                    <View style={s.sectionsPill}>
                      <Text style={s.sectionsPillText}>
                        {cls.sectionsCount} Sections
                      </Text>
                    </View>
                  </View>

                  <Text style={s.classCardTitle}>{cls.name}</Text>
                  <View style={s.enrolledRow}>
                    <Users size={13} color="#64748B" />
                    <Text style={s.enrolledText}>
                      {cls.studentsCount} Students Enrolled
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleSelectClass(cls)}
                    style={s.viewSectionsBtn}
                  >
                    <Text style={s.viewSectionsText}>View Sections</Text>
                    <ArrowRight size={14} color="#4F46E5" />
                  </Pressable>
                </Card>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 4. VIEW 2: SELECT A SECTION */}
      {viewMode === 'sections' && selectedClass && (
        <View style={s.sectionsView}>
          <View style={s.sectionHeaderRow}>
            <View>
              <Text style={s.sectionTitle}>
                {selectedClass.name} — Select a Section
              </Text>
              <Text style={s.sectionSub}>
                Select a section to inspect period attendance and live student rosters.
              </Text>
            </View>
            <Pressable
              onPress={() => setViewMode('classes')}
              style={s.backToClassesBtn}
            >
              <ArrowLeft size={13} color="#4F46E5" />
              <Text style={s.backToClassesText}>Back to Classes</Text>
            </Pressable>
          </View>

          <View style={s.classesGrid}>
            {(selectedClass.sections || []).map((sec) => (
              <Card key={sec.id} style={s.classCard}>
                <View style={s.classCardTop}>
                  <View style={s.classNumCircle}>
                    <Text style={s.classNumText}>{sec.name}</Text>
                  </View>
                  <View style={s.sectionsPill}>
                    <Text style={s.sectionsPillText}>{sec.label}</Text>
                  </View>
                </View>

                <Text style={s.classCardTitle}>
                  {selectedClass.name} · {sec.label}
                </Text>
                <View style={s.enrolledRow}>
                  <Users size={13} color="#64748B" />
                  <Text style={s.enrolledText}>
                    {sec.studentsCount} Students Enrolled
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleSelectSection(sec)}
                  style={s.viewSectionsBtn}
                >
                  <Text style={s.viewSectionsText}>Open Attendance</Text>
                  <ArrowRight size={14} color="#4F46E5" />
                </Pressable>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* 5. VIEW 3: LIVE ATTENDANCE REGISTER & PERIOD TIMETABLE */}
      {viewMode === 'register' && (
        <View style={s.registerView}>
          {/* 6-PERIOD TIMETABLE STRIP (Dynamic Day and Date) */}
          <Card style={s.timetableCard}>
            <View style={s.timetableHeader}>
              <View style={s.timetableTitleRow}>
                <Clock size={14} color="#4F46E5" />
                <Text style={s.timetableTitle}>
                  6-PERIOD TIMETABLE FOR {currentDate}:
                </Text>
              </View>
              <Text style={s.timetableClassTag}>
                {selectedClass?.name || 'Class'} · {selectedSection?.label || 'Section'}
              </Text>
            </View>

            {/* Horizontal 6 Periods Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.periodsScroll}
            >
              {PERIODS.map((p) => {
                const isActive = activePeriod === p.period;
                const stats = periodStats[p.period] || { present: 0, absent: 0 };
                return (
                  <Pressable
                    key={p.period}
                    onPress={() => setActivePeriod(p.period)}
                    style={[
                      s.periodBlock,
                      isActive ? s.periodBlockActive : s.periodBlockInactive,
                    ]}
                  >
                    <View style={s.periodTop}>
                      <Text
                        style={[
                          s.periodPNum,
                          isActive && s.periodPNumActive,
                        ]}
                      >
                        P{p.period}
                      </Text>
                      <Text
                        style={[
                          s.periodTime,
                          isActive && s.periodTimeActive,
                        ]}
                      >
                        {p.time}
                      </Text>
                    </View>

                    <Text
                      style={[
                        s.periodName,
                        isActive && s.periodNameActive,
                      ]}
                    >
                      {p.name}
                    </Text>

                    <View style={s.periodStatsRow}>
                      <Text
                        style={[
                          s.periodStatsTextP,
                          isActive && s.periodStatsTextActive,
                        ]}
                      >
                        P: {stats.present}
                      </Text>
                      <Text
                        style={[
                          s.periodStatsTextA,
                          isActive && s.periodStatsTextActive,
                        ]}
                      >
                        A: {stats.absent}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>

          {/* SEARCH & FILTER BAR */}
          <Card style={s.filterCard}>
            {/* Search Input */}
            <View style={s.searchWrap}>
              <Search size={15} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search student..."
                placeholderTextColor="#94A3B8"
                style={s.searchInput}
              />
            </View>

            {/* Filter Tabs Scrollable */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterTabsScroll}
            >
              <Pressable
                onPress={() => setFilterTab('all')}
                style={[
                  s.filterTabBtn,
                  filterTab === 'all' && s.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterTab === 'all' && s.filterTabTextActive,
                  ]}
                >
                  All ({activePeriodCounts.all})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterTab('present')}
                style={[
                  s.filterTabBtn,
                  filterTab === 'present' && s.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterTab === 'present' && s.filterTabTextActive,
                  ]}
                >
                  Present ({activePeriodCounts.present})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterTab('absent')}
                style={[
                  s.filterTabBtn,
                  filterTab === 'absent' && s.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterTab === 'absent' && s.filterTabTextActive,
                  ]}
                >
                  Absent ({activePeriodCounts.absent})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterTab('late')}
                style={[
                  s.filterTabBtn,
                  filterTab === 'late' && s.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterTab === 'late' && s.filterTabTextActive,
                  ]}
                >
                  Late ({activePeriodCounts.late})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterTab('unmarked')}
                style={[
                  s.filterTabBtn,
                  filterTab === 'unmarked' && s.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    s.filterTabText,
                    filterTab === 'unmarked' && s.filterTabTextActive,
                  ]}
                >
                  Unmarked ({activePeriodCounts.unmarked})
                </Text>
              </Pressable>
            </ScrollView>

            {/* Bulk Action Buttons Row */}
            <View style={s.bulkActionsRow}>
              <Pressable
                onPress={handleMarkAllFullDayPresent}
                style={s.bulkFullDayBtn}
              >
                <Text style={s.bulkFullDayText}>Full Day Present</Text>
              </Pressable>

              <Pressable
                onPress={handleMarkAllPeriodPresent}
                style={s.bulkPresentBtn}
              >
                <Check size={13} color="#059669" strokeWidth={2.5} />
                <Text style={s.bulkPresentText}>
                  All Present (P{activePeriod})
                </Text>
              </Pressable>

              <Pressable
                onPress={handleMarkAllPeriodAbsent}
                style={s.bulkAbsentBtn}
              >
                <X size={13} color="#DC2626" strokeWidth={2.5} />
                <Text style={s.bulkAbsentText}>
                  All Absent (P{activePeriod})
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* STUDENT ATTENDANCE ROSTER LIST */}
          <View style={s.rosterList}>
            {filteredRoster.map((st) => {
              const currentPeriodStatus = st.periods[activePeriod];
              let pCount = 0;
              let aCount = 0;
              let loggedCount = 0;
              for (let i = 1; i <= 6; i++) {
                if (st.periods[i] === 'Present') {
                  pCount++;
                  loggedCount++;
                } else if (st.periods[i] === 'Absent') {
                  aCount++;
                  loggedCount++;
                } else if (st.periods[i] === 'Late') {
                  loggedCount++;
                }
              }

              return (
                <Card key={st.id} style={s.studentCard}>
                  {/* Top: Avatar, Name & Roll, and Summary Counts */}
                  <View style={s.studentTopRow}>
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarInitial}>
                        {st.name.charAt(0).toLowerCase()}
                      </Text>
                    </View>

                    <View style={s.studentMetaCol}>
                      <Text style={s.studentName}>{st.name}</Text>
                      <Text style={s.studentRoll}>
                        Roll #{st.rollNo} · {st.admissionNo}
                      </Text>
                    </View>

                    <View style={s.summaryStatsCol}>
                      <Text style={s.summaryCounts}>
                        {pCount}P / {aCount}A
                      </Text>
                      <Text style={s.loggedCountText}>
                        {loggedCount}/6 Logged
                      </Text>
                    </View>
                  </View>

                  {/* 6 Periods Status Chips Row */}
                  <View style={s.periodsChipRow}>
                    <Text style={s.periodChipLabel}>TODAY'S 6 PERIODS:</Text>
                    <View style={s.chipGroup}>
                      {[1, 2, 3, 4, 5, 6].map((pNum) => {
                        const stat = st.periods[pNum];
                        const isThisActive = pNum === activePeriod;
                        return (
                          <Pressable
                            key={pNum}
                            onPress={() => setActivePeriod(pNum)}
                            style={[
                              s.periodChip,
                              isThisActive && s.periodChipActive,
                              stat === 'Present' && s.periodChipP,
                              stat === 'Absent' && s.periodChipA,
                              stat === 'Late' && s.periodChipL,
                            ]}
                          >
                            <Text
                              style={[
                                s.periodChipText,
                                isThisActive && s.periodChipTextActive,
                                stat === 'Present' && s.periodChipTextP,
                                stat === 'Absent' && s.periodChipTextA,
                              ]}
                            >
                              P{pNum}:{' '}
                              {stat === 'Present'
                                ? 'P'
                                : stat === 'Absent'
                                ? 'A'
                                : stat === 'Late'
                                ? 'L'
                                : '—'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Quick Action Controls */}
                  <View style={s.studentActionsRow}>
                    <Pressable
                      onPress={() => markStudentFullDay(st.id)}
                      style={s.fullDayStudentBtn}
                    >
                      <Check size={12} color="#059669" strokeWidth={2.5} />
                      <Text style={s.fullDayStudentText}>Full Day</Text>
                    </Pressable>

                    <View style={s.actionCirclesGroup}>
                      {/* Present Button */}
                      <Pressable
                        onPress={() => markStudentPeriod(st.id, 'Present')}
                        style={[
                          s.actionCircle,
                          currentPeriodStatus === 'Present' &&
                            s.actionCirclePresentActive,
                        ]}
                      >
                        <Check
                          size={14}
                          color={
                            currentPeriodStatus === 'Present'
                              ? '#FFFFFF'
                              : '#64748B'
                          }
                          strokeWidth={2.5}
                        />
                      </Pressable>

                      {/* Absent Button */}
                      <Pressable
                        onPress={() => markStudentPeriod(st.id, 'Absent')}
                        style={[
                          s.actionCircle,
                          currentPeriodStatus === 'Absent' &&
                            s.actionCircleAbsentActive,
                        ]}
                      >
                        <X
                          size={14}
                          color={
                            currentPeriodStatus === 'Absent'
                              ? '#FFFFFF'
                              : '#64748B'
                          }
                          strokeWidth={2.5}
                        />
                      </Pressable>

                      {/* Late Button */}
                      <Pressable
                        onPress={() => markStudentPeriod(st.id, 'Late')}
                        style={[
                          s.actionCircle,
                          currentPeriodStatus === 'Late' &&
                            s.actionCircleLateActive,
                        ]}
                      >
                        <AlertTriangle
                          size={13}
                          color={
                            currentPeriodStatus === 'Late'
                              ? '#FFFFFF'
                              : '#64748B'
                          }
                          strokeWidth={2.5}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 14,
  },

  /* 1. Header Card */
  headerCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTopRow: {
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  dailyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dailyPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4F46E5',
  },
  dailyPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#64748B',
    marginTop: 3,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  datePickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  datePickerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* 2. Breadcrumb Bar */
  breadcrumbCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  breadcrumbActive: {
    backgroundColor: '#4F46E5',
  },
  breadcrumbInactive: {
    backgroundColor: '#EEF2FF',
  },
  breadcrumbText: {
    fontSize: 11,
  },
  breadcrumbTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  breadcrumbTextInactive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  /* 3. Classes & Sections View */
  classesView: {
    gap: 12,
  },
  sectionsView: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 240,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  backToClassesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  backToClassesText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  classCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classNumCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classNumText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionsPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  sectionsPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  classCardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 3,
  },
  enrolledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  enrolledText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  viewSectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  viewSectionsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },

  /* 4. Live Attendance Register View */
  registerView: {
    gap: 12,
  },
  timetableCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  timetableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  timetableTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  timetableClassTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  periodsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  periodBlock: {
    width: 88,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  periodBlockActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  periodBlockInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  periodPNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  periodPNumActive: {
    color: '#FFFFFF',
  },
  periodTime: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTimeActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  periodNameActive: {
    color: '#FFFFFF',
  },
  periodStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodStatsTextP: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  periodStatsTextA: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  periodStatsTextActive: {
    color: '#FFFFFF',
  },

  /* Filter Card */
  filterCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 3,
  },
  filterTabsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  filterTabBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bulkFullDayBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkFullDayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bulkPresentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkPresentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  bulkAbsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkAbsentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* Student Roster Cards */
  rosterList: {
    gap: 10,
  },
  studentCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  studentMetaCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentRoll: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  summaryStatsCol: {
    alignItems: 'flex-end',
  },
  summaryCounts: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  loggedCountText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  periodsChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  periodChipLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  periodChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodChipActive: {
    borderColor: '#4F46E5',
  },
  periodChipP: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  periodChipA: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  periodChipL: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  periodChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  periodChipTextActive: {
    color: '#4F46E5',
  },
  periodChipTextP: {
    color: '#16A34A',
  },
  periodChipTextA: {
    color: '#DC2626',
  },
  studentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  fullDayStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  fullDayStudentText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  actionCirclesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCirclePresentActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  actionCircleAbsentActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  actionCircleLateActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
});
