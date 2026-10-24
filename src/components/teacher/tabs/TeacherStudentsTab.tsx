import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  Image,
} from 'react-native';
import {
  GraduationCap,
  Users,
  User,
  Shield,
  Search,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react-native';
import { Card, InitialsAvatar } from '../../common';
import type { Student } from '../../../types/student';

/**
 * Baseline roster seeded from Web Teacher Portal screenshots:
 * - ganesh (Class 1-A, ADM-202627-MV6A8C93, Roll #1, Guardian: ullasam, Phone: 9442963618)
 * - Diya Das (Class 1-A, DEM01A001, Roll #1)
 * - Aadhya Chandra (Class 2-A, DEM02A001, Roll #1)
 * - Tejas Naidu (Class 3-A, DEM03A001, Roll #1)
 * - Gowri Sharma (Class 4-A, DEM04A001, Roll #1)
 * - Vihaan Desai (Class 5-A, DEM05A001, Roll #1)
 */
export function TeacherStudentsTab({
  students = [],
}: {
  students: Array<Partial<Student>>;
}) {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Assigned');
  const [selectedSection, setSelectedSection] = useState('All Sections');

  const allStudents = useMemo<Student[]>(() => {
    return (students || []).map((s) => ({
      id: s.id || 0,
      schoolId: s.schoolId || '',
      name: s.name || 'Student',
      admissionNo: s.admissionNo || `ADM-${s.id || 0}`,
      className: s.className || 'Class',
      sectionName: s.sectionName || 'A',
      sectionId: s.sectionId || 1,
      rollNo: s.rollNo || '-',
      dob: s.dob || '',
      gender: s.gender || 'Other',
      parentName: s.parentName || 'Parent / Guardian',
      parentPhone: s.parentPhone || '',
      parentEmail: s.parentEmail || '',
      address: s.address || '',
      status: s.status || 'Active',
      academicYear: s.academicYear || '',
      photoUrl: s.photoUrl,
    }));
  }, [students]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(allStudents[0] || null);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    if (!selectedStudent && allStudents.length > 0) {
      setSelectedStudent(allStudents[0]);
    }
  }, [allStudents, selectedStudent]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s.className) set.add(`${s.className}${s.sectionName ? '-' + s.sectionName : ''}`);
    });
    const arr = Array.from(set);
    return ['All Assigned', ...arr];
  }, [allStudents]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s.sectionName) set.add(`Section ${s.sectionName}`);
    });
    const arr = Array.from(set);
    return ['All Sections', ...arr];
  }, [allStudents]);

  // Dynamic Metrics Computed from Real Backend Students
  const boysCount = useMemo(() => {
    return allStudents.filter((s) => {
      const g = (s.gender || '').toLowerCase();
      return g === 'male' || g === 'boy' || g === 'm';
    }).length;
  }, [allStudents]);
  const boysRatio = allStudents.length > 0 ? Math.round((boysCount / allStudents.length) * 100) : 0;

  const girlsCount = useMemo(() => {
    return allStudents.filter((s) => {
      const g = (s.gender || '').toLowerCase();
      return g === 'female' || g === 'girl' || g === 'f';
    }).length;
  }, [allStudents]);
  const girlsRatio = allStudents.length > 0 ? Math.round((girlsCount / allStudents.length) * 100) : 0;

  const classAttendanceAvg = useMemo(() => {
    const withAtt = allStudents.filter(
      (s) => typeof s.attendancePercentage === 'number' && s.attendancePercentage > 0
    );
    if (withAtt.length > 0) {
      const sum = withAtt.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
      return `${Math.round(sum / withAtt.length)}%`;
    }
    return allStudents.length > 0 ? '100%' : '0%';
  }, [allStudents]);

  const assignedClassSections = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s.className) {
        const cls = s.className.replace(/^Class\s*/i, '');
        const sec = s.sectionName || 'A';
        set.add(`${cls}-${sec}`);
      }
    });
    return Array.from(set);
  }, [allStudents]);

  // Filtered list based on search, class, and section
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = (st.name || '').toLowerCase().includes(query);
        const matchesAdm = (st.admissionNo || '').toLowerCase().includes(query);
        const matchesRoll = (st.rollNo || '').toLowerCase().includes(query);
        const matchesPhone = (st.parentPhone || '').includes(query);
        if (!matchesName && !matchesAdm && !matchesRoll && !matchesPhone) return false;
      }
      // Class filter
      if (selectedClass !== 'All Assigned') {
        const classStr = `${st.className}-${st.sectionName}`.toLowerCase().replace(/\s+/g, '');
        const targetStr = selectedClass.toLowerCase().replace(/\s+/g, '');
        if (!classStr.includes(targetStr) && !targetStr.includes(classStr)) return false;
      }
      // Section filter
      if (selectedSection !== 'All Sections') {
        const secLetter = selectedSection.replace('Section', '').trim();
        if (st.sectionName !== secLetter) return false;
      }
      return true;
    });
  }, [allStudents, search, selectedClass, selectedSection]);

  const handleCallGuardian = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'Guardian phone number is not available.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${phone}`);
    });
  };

  const handleEmailGuardian = (email?: string) => {
    if (!email) {
      Alert.alert('No Email', 'Guardian email is not available.');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Email', `Composing to ${email}`);
    });
  };

  return (
    <View style={s.col}>
      {/* 1. HEADER HERO TITLE BANNER */}
      <Card style={s.heroCard}>
        <View style={s.badgeRow}>
          <View style={s.pillBlue}>
            <View style={s.blueDot} />
            <Text style={s.pillBlueText}>Teacher View</Text>
          </View>
          <View style={s.pillGray}>
            <Text style={s.pillGrayText}>Roster & Lifecycle Portal</Text>
          </View>
        </View>

        <Text style={s.heroTitle}>My Assigned Students</Text>
        <Text style={s.heroSub}>
          Only students in your assigned class sections are shown. Open a profile to review learning details or contact the student and guardian.
        </Text>

        {/* Access Restriction Notice Banner */}
        <View style={s.accessBanner}>
          <View style={s.accessIconWrap}>
            <User size={15} color="#4F46E5" />
          </View>
          <Text style={s.accessText}>
            Assignment-scoped access is active. Unassigned classes and students are not available in this directory.
          </Text>
          <View style={s.assignedCountPill}>
            <Text style={s.assignedCountText}>{allStudents.length} ASSIGNED STUDENTS</Text>
          </View>
        </View>
      </Card>

      {/* 2. ASSIGNED ROSTER SUMMARY (5 METRIC CARDS WITH PERFECT SCREEN RATIO) */}
      <Card style={s.summaryCard}>
        <View style={s.summaryHeaderRow}>
          <View>
            <Text style={s.summaryPreTitle}>ASSIGNED ROSTER SUMMARY</Text>
            <View style={s.summaryTitleRow}>
              <Text style={s.summaryTitle}>My assigned classes</Text>
              <Text style={s.cycleDot}>·</Text>
              <Text style={s.cycleText}>2026-27</Text>
            </View>
          </View>
          <View style={s.serverScopeBadge}>
            <Shield size={12} color="#1E6BFF" />
            <Text style={s.serverScopeText}>Server-scoped access</Text>
          </View>
        </View>

        {/* Responsive 2x2 Grid + Full Row: Guaranteed Perfect Aspect Ratio on All Mobiles */}
        <View style={s.statsContainer}>
          {/* Row 1: Total Students & Boys Ratio */}
          <View style={s.statsRow}>
            <View style={[s.statTile, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
              <Text style={[s.statTileLabel, { color: '#6D28D9' }]}>TOTAL STUDENTS</Text>
              <Text style={[s.statTileValue, { color: '#4F46E5' }]}>{allStudents.length.toLocaleString()}</Text>
            </View>

            <View style={[s.statTile, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[s.statTileLabel, { color: '#1D4ED8' }]}>BOYS RATIO</Text>
              <View style={s.valWithRatioRow}>
                <Text style={[s.statTileValue, { color: '#1E6BFF' }]}>{boysCount.toLocaleString()}</Text>
                <Text style={s.ratioSubText}>({boysRatio}%)</Text>
              </View>
            </View>
          </View>

          {/* Row 2: Girls Ratio & Class Attendance */}
          <View style={s.statsRow}>
            <View style={[s.statTile, { backgroundColor: '#FDF2F8', borderColor: '#FBCFE8' }]}>
              <Text style={[s.statTileLabel, { color: '#BE185D' }]}>GIRLS RATIO</Text>
              <View style={s.valWithRatioRow}>
                <Text style={[s.statTileValue, { color: '#DB2777' }]}>{girlsCount.toLocaleString()}</Text>
                <Text style={s.ratioSubText}>({girlsRatio}%)</Text>
              </View>
            </View>

            <View style={[s.statTile, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={[s.statTileLabel, { color: '#047857' }]}>CLASS ATTENDANCE</Text>
              <View style={s.valWithRatioRow}>
                <Text style={[s.statTileValue, { color: '#059669' }]}>{classAttendanceAvg}</Text>
                <Text style={s.ratioSubText}>avg</Text>
              </View>
            </View>
          </View>

          {/* Row 3: Visible Classes Full-Width */}
          <View style={[s.statTileFull, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <View>
              <Text style={[s.statTileLabel, { color: '#B45309' }]}>VISIBLE CLASSES</Text>
              <View style={s.visibleClassesRow}>
                <BookOpen size={16} color="#D97706" />
                <Text style={[s.statTileValue, { color: '#D97706', marginLeft: 6 }]}>
                  {assignedClassSections.length}
                </Text>
                <Text style={s.classesSubText}>Active Class Sections Assigned</Text>
              </View>
            </View>
            <View style={s.classChipsPreview}>
              {assignedClassSections.length > 0 ? (
                assignedClassSections.map((cs) => (
                  <View key={cs} style={s.previewChip}>
                    <Text style={s.previewChipText}>{cs}</Text>
                  </View>
                ))
              ) : (
                <View style={s.previewChip}>
                  <Text style={s.previewChipText}>All</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>

      {/* 3. FILTER DROPDOWNS & SEARCH ROW */}
      <Card style={s.filterCard}>
        {/* Academic Year, Class, Section Selectors */}
        <View style={s.dropdownsRow}>
          {/* Year selector */}
          <View style={s.dropdownCol}>
            <Text style={s.dropdownLabel}>ACADEMIC YEAR</Text>
            <View style={s.pickerBox}>
              <Text style={s.pickerValue}>2026-27</Text>
            </View>
          </View>

          {/* Section selector */}
          <View style={s.dropdownCol}>
            <Text style={s.dropdownLabel}>SECTION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.smallPillsRow}>
                {sectionOptions.map((sec) => {
                  const isSel = selectedSection === sec;
                  return (
                    <Pressable
                      key={sec}
                      onPress={() => setSelectedSection(sec)}
                      style={[s.miniPill, isSel && s.miniPillSelected]}
                    >
                      <Text style={[s.miniPillText, isSel && s.miniPillTextSelected]}>
                        {sec}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Class / Grade Filter Scrollable Pills */}
        <View style={{ marginTop: 10 }}>
          <Text style={s.dropdownLabel}>CLASS / GRADE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.classFilterScroll}>
            {classOptions.map((c) => {
              const isSel = selectedClass === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setSelectedClass(c)}
                  style={[s.classFilterPill, isSel && s.classFilterPillSelected]}
                >
                  <Text style={[s.classFilterText, isSel && s.classFilterTextSelected]}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Search input with live filter */}
        <View style={s.searchBarContainer}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Name, ADM-ID, Roll, Mobile..."
            placeholderTextColor="#94A3B8"
            style={s.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={6}>
              <X size={16} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>
      </Card>

      {/* 4. SELECTED STUDENT FULL PROFILE CARD (MATCHING WEB PORTAL DETAIL PANE) */}
      {selectedStudent && (
        <Card style={s.detailCard}>
          {/* Header of selected student */}
          <View style={s.detailHeader}>
            <View style={s.avatarWrap}>
              {selectedStudent.photoUrl ? (
                <Image
                  source={{ uri: selectedStudent.photoUrl }}
                  style={s.crestImage}
                  resizeMode="cover"
                />
              ) : (
                <InitialsAvatar
                  name={selectedStudent.name}
                  size={52}
                  fontSize={18}
                  bgColor="#1E6BFF"
                />
              )}
            </View>

            <View style={s.detailHeaderMeta}>
              <View style={s.cycleTag}>
                <Text style={s.cycleTagText}>CYCLE 2026-27</Text>
              </View>
              <Text style={s.detailName}>{selectedStudent.name}</Text>
              <Text style={s.detailSub}>
                Class: {selectedStudent.className} - {selectedStudent.sectionName} · Admission: {selectedStudent.admissionNo} · Roll: #{selectedStudent.rollNo}
              </Text>
            </View>

            <View style={s.activeEnrolledBadge}>
              <Text style={s.activeEnrolledText}>ACTIVE ENROLLED</Text>
            </View>
          </View>

          {/* 3 Detail Boxes: Personal Particulars & Parent/Guardian Details & Class Subjects */}
          <View style={s.detailSection}>
            {/* Box 1: Personal Particulars */}
            <View style={s.detailBox}>
              <Text style={s.detailBoxTitle}>PERSONAL PARTICULARS</Text>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Date of Birth:</Text>
                <Text style={s.detailValue}>{selectedStudent.dob || '-'}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Gender:</Text>
                <Text style={s.detailValue}>{selectedStudent.gender || '-'}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Admission ID:</Text>
                <Text style={s.detailValueCode}>{selectedStudent.admissionNo}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Roll Number:</Text>
                <Text style={s.detailValue}>#{selectedStudent.rollNo}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Status:</Text>
                <Text style={[s.detailValue, { color: '#16A34A', fontWeight: '800' }]}>Active</Text>
              </View>
            </View>

            {/* Box 2: Parent / Guardian Details */}
            <View style={s.detailBox}>
              <Text style={s.detailBoxTitle}>PARENT / GUARDIAN DETAILS</Text>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Primary Guardian:</Text>
                <Text style={s.detailValueBold}>{selectedStudent.parentName || 'Guardian'}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Emergency Phone:</Text>
                <Pressable
                  onPress={() => handleCallGuardian(selectedStudent.parentPhone)}
                  style={s.phoneLink}
                >
                  <Text style={s.phoneLinkText}>
                    {selectedStudent.parentPhone || 'Not on file'}
                  </Text>
                  <Phone size={13} color="#1E6BFF" />
                </Pressable>
              </View>

              {/* Action Buttons: Direct Call & Email */}
              <View style={s.guardianActionRow}>
                <Pressable
                  onPress={() => handleCallGuardian(selectedStudent.parentPhone)}
                  style={s.callBtn}
                >
                  <Phone size={14} color="#FFFFFF" />
                  <Text style={s.callBtnText}>Call Guardian</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleEmailGuardian(selectedStudent.parentEmail)}
                  style={s.emailBtn}
                >
                  <Mail size={14} color="#334155" />
                  <Text style={s.emailBtnText}>Email</Text>
                </Pressable>
              </View>
            </View>

            {/* Box 3: Class Subjects */}
            <View style={s.detailBox}>
              <Text style={s.detailBoxTitle}>CLASS ENROLLMENT DETAILS</Text>
              <Text style={s.subjectsSubText}>
                Curriculum and section enrollment for {selectedStudent.className} - {selectedStudent.sectionName}.
              </Text>
              <View style={s.subjectsTagsRow}>
                <View style={[s.subjectTagItem, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                  <Text style={[s.subjectTagText, { color: '#4F46E5' }]}>{selectedStudent.className}</Text>
                </View>
                <View style={[s.subjectTagItem, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Text style={[s.subjectTagText, { color: '#059669' }]}>Section {selectedStudent.sectionName}</Text>
                </View>
                <View style={[s.subjectTagItem, { backgroundColor: '#FDF2F8', borderColor: '#FBCFE8' }]}>
                  <Text style={[s.subjectTagText, { color: '#DB2777' }]}>Roll #{selectedStudent.rollNo}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* 5. MASTER STUDENT ROSTER LIST (1-1 PARITY WITH WEB SCREENSHOTS) */}
      <Card style={s.rosterCard}>
        <View style={s.rosterHeaderRow}>
          <Text style={s.rosterSectionTitle}>Student Roster Directory</Text>
          <Text style={s.rosterCountBadge}>{filteredStudents.length} Students</Text>
        </View>

        {filteredStudents.length === 0 ? (
          <View style={s.emptyContainer}>
            <Users size={36} color="#CBD5E1" />
            <Text style={s.emptyTitle}>No matching students found</Text>
            <Text style={s.emptySub}>Try adjusting your search query or class filter.</Text>
          </View>
        ) : (
          <View style={s.studentListCol}>
            {filteredStudents.map((st) => {
              const isSelected = selectedStudent?.id === st.id;
              return (
                <Pressable
                  key={st.id}
                  onPress={() => setSelectedStudent(st)}
                  style={[s.studentRow, isSelected && s.studentRowSelected]}
                >
                  {/* Left Avatar: Photo or InitialsAvatar */}
                  <View style={s.rowAvatarWrap}>
                    {st.photoUrl ? (
                      <Image
                        source={{ uri: st.photoUrl }}
                        style={s.rowCrestImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <InitialsAvatar
                        name={st.name}
                        size={38}
                        fontSize={13}
                        bgColor={isSelected ? '#1E6BFF' : '#64748B'}
                      />
                    )}
                  </View>

                  {/* Student Details */}
                  <View style={s.rowMetaCol}>
                    <Text style={[s.rowName, isSelected && s.rowNameSelected]}>
                      {st.name}
                    </Text>
                    <Text style={s.rowSub}>
                      {st.admissionNo} · Roll: #{st.rollNo}
                    </Text>
                  </View>

                  {/* Right Tags: Class & Active */}
                  <View style={s.rowRightCol}>
                    <View style={s.classBadge}>
                      <Text style={s.classBadgeText}>
                        {st.className.toUpperCase()} - {st.sectionName.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.activeText}>ACTIVE</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* 6. PAGINATION FOOTER */}
        <View style={s.paginationRow}>
          <Text style={s.paginationCount}>
            Showing <Text style={s.paginationBold}>1-{filteredStudents.length}</Text> of{' '}
            <Text style={s.paginationBold}>{allStudents.length.toLocaleString()}</Text> students
          </Text>

          <View style={s.pageControlsRow}>
            <Pressable
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              style={[s.pageBtn, currentPage === 1 && s.pageBtnDisabled]}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} color={currentPage === 1 ? '#CBD5E1' : '#334155'} />
            </Pressable>
            <View style={s.pageNumberBadge}>
              <Text style={s.pageNumberText}>
                Page {currentPage} of {Math.max(1, Math.ceil(allStudents.length / 50))}
              </Text>
            </View>
            <Pressable
              onPress={() => setCurrentPage(currentPage + 1)}
              style={s.pageBtn}
            >
              <ChevronRight size={16} color="#334155" />
            </Pressable>
          </View>
        </View>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  col: {
    gap: 14,
  },

  /* Hero Card */
  heroCard: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pillBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  pillBlueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pillGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  pillGrayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  accessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  accessIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  assignedCountPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  assignedCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E6BFF',
    letterSpacing: 0.3,
  },

  /* Assigned Roster Summary Card */
  summaryCard: {
    padding: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryPreTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cycleDot: {
    fontSize: 14,
    color: '#94A3B8',
  },
  cycleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  serverScopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  serverScopeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },

  /* 2x2 Stats Grid with perfect ratio */
  statsContainer: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statTileLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statTileValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  valWithRatioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  ratioSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statTileFull: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  visibleClassesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  classesSubText: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '600',
    marginLeft: 8,
  },
  classChipsPreview: {
    flexDirection: 'row',
    gap: 5,
  },
  previewChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  previewChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },

  /* Filters */
  filterCard: {
    padding: 14,
    gap: 10,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownCol: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  pickerBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  smallPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniPillSelected: {
    backgroundColor: '#1E6BFF',
    borderColor: '#1E6BFF',
  },
  miniPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  miniPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  classFilterScroll: {
    gap: 6,
  },
  classFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classFilterPillSelected: {
    backgroundColor: '#1E6BFF',
    borderColor: '#1E6BFF',
  },
  classFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  classFilterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 4,
  },

  /* Detail Card */
  detailCard: {
    padding: 16,
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  crestImage: {
    width: 44,
    height: 44,
  },
  detailHeaderMeta: {
    flex: 1,
  },
  cycleTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  cycleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.3,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  activeEnrolledBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeEnrolledText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  detailSection: {
    gap: 12,
    marginTop: 14,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  detailBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailValueCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E6BFF',
  },
  phoneLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E6BFF',
  },
  guardianActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E6BFF',
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  subjectsSubText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  subjectsTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectTagItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  /* Roster List Card */
  rosterCard: {
    padding: 14,
  },
  rosterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rosterSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  rosterCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  studentListCol: {
    gap: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  studentRowSelected: {
    borderColor: '#1E6BFF',
    backgroundColor: '#F0F7FF',
  },
  rowAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  rowCrestImage: {
    width: 32,
    height: 32,
  },
  rowMetaCol: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowNameSelected: {
    color: '#1E6BFF',
  },
  rowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rowRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  classBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },

  /* Pagination */
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8,
  },
  paginationCount: {
    fontSize: 11,
    color: '#64748B',
  },
  paginationBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  pageControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  pageNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  pageNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});
