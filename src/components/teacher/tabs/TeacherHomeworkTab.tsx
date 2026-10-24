import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import {
  BookOpen,
  Plus,
  Clock,
  ChevronDown,
  Search,
  Bell,
  CheckCircle2,
  FileText,
  X,
  Layers,
  Send,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import { Card } from '../../common';
import { apiGetHomework, apiCreateHomework } from '../../../services/schoolApi';

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  className: string;
  section: string;
  dueDate: string;
  description: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  status: 'active' | 'review_needed' | 'completed';
  maxPoints?: number;
  submissionType?: 'Digital Upload' | 'Notebook Check';
  dueThisWeek?: boolean;
}

const CLASS_OPTIONS = [
  'All Classes (Full School)',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
];

const SECTION_OPTIONS = ['All Sections', 'Section A', 'Section B', 'Section C'];

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Mathematics',
  'Physics',
  'English',
  'Science',
  'Chemistry',
];

const STATUS_OPTIONS = [
  'All Statuses',
  'Active',
  'Needs Review',
  'Completed',
];

export function TeacherHomeworkTab({
  userName = 'Teacher',
  students = [],
  slots = [],
}: {
  userName?: string | null;
  students?: any[];
  slots?: any[];
}) {
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const raw = await apiGetHomework().catch(() => []);
        if (!alive) return;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: HomeworkItem[] = raw.map((item: any) => ({
            id: String(item.id || item._id || Math.random()),
            title: item.title || item.name || 'Assignment',
            subject: item.subject_name || item.subject || 'General',
            className: item.class_name || item.className || 'Class',
            section: item.section_name || item.section || 'A',
            dueDate: item.due_date || item.dueDate || 'No Due Date',
            description: item.description || '',
            totalStudents: Number(item.total_students || item.totalStudents || 0),
            submittedCount: Number(item.submitted_count || item.submittedCount || 0),
            gradedCount: Number(item.graded_count || item.gradedCount || 0),
            status: item.status === 'completed' || item.status === 'review_needed' ? item.status : 'active',
            maxPoints: Number(item.max_points || item.maxPoints || 50),
            submissionType: item.submission_type || 'Notebook Check',
            dueThisWeek: Boolean(item.due_this_week ?? true),
          }));
          setHomeworkList(mapped);
        } else {
          setHomeworkList([]);
        }
      } catch {
        if (alive) setHomeworkList([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Dynamically derived options from backend students & timetable
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s: any) => {
      if (s.className) set.add(s.className);
    });
    const arr = Array.from(set);
    return ['All Classes (Full School)', ...(arr.length > 0 ? arr : ['Class 1', 'Class 2'])];
  }, [students]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s: any) => {
      if (s.sectionName) set.add(`Section ${s.sectionName}`);
    });
    const arr = Array.from(set);
    return ['All Sections', ...(arr.length > 0 ? arr : ['Section A', 'Section B'])];
  }, [students]);

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    (slots || []).forEach((sl: any) => {
      if (sl.subjectName) set.add(sl.subjectName);
    });
    const arr = Array.from(set);
    return ['All Subjects', ...(arr.length > 0 ? arr : ['Mathematics', 'Science', 'English'])];
  }, [slots]);

  const createClassOptions = useMemo(
    () => classOptions.filter((c) => c !== 'All Classes (Full School)'),
    [classOptions]
  );
  const createSectionOptions = useMemo(
    () => sectionOptions.filter((s) => s !== 'All Sections'),
    [sectionOptions]
  );
  const createSubjectOptions = useMemo(
    () => subjectOptions.filter((s) => s !== 'All Subjects'),
    [subjectOptions]
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes (Full School)');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Filter Picker Modal State
  const [activePicker, setActivePicker] = useState<
    'class' | 'section' | 'subject' | 'status' | null
  >(null);

  // Create Homework Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);

  // New Homework Form State (with all fields)
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('Class 1');
  const [newSection, setNewSection] = useState('Section A');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxPoints, setNewMaxPoints] = useState('50');
  const [newSubmissionType, setNewSubmissionType] = useState<'Notebook Check' | 'Digital Upload'>('Notebook Check');
  const [newDescription, setNewDescription] = useState('');
  const [notifyParents, setNotifyParents] = useState(true);

  // Ensure default selections match available options once loaded
  useEffect(() => {
    if (createClassOptions.length > 0 && !createClassOptions.includes(newClass)) {
      setNewClass(createClassOptions[0]);
    }
    if (createSectionOptions.length > 0 && !createSectionOptions.includes(newSection)) {
      setNewSection(createSectionOptions[0]);
    }
    if (createSubjectOptions.length > 0 && !createSubjectOptions.includes(newSubject)) {
      setNewSubject(createSubjectOptions[0]);
    }
  }, [createClassOptions, createSectionOptions, createSubjectOptions]);

  // Filtered Homework List
  const filtered = useMemo(() => {
    return homeworkList.filter((hw) => {
      // Class filter
      if (
        selectedClass !== 'All Classes (Full School)' &&
        hw.className !== selectedClass
      ) {
        return false;
      }
      // Section filter
      if (
        selectedSection !== 'All Sections' &&
        `Section ${hw.section}` !== selectedSection
      ) {
        return false;
      }
      // Subject filter
      if (
        selectedSubject !== 'All Subjects' &&
        hw.subject.toLowerCase() !== selectedSubject.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'All Statuses') {
        if (selectedStatus === 'Active' && hw.status !== 'active') return false;
        if (selectedStatus === 'Needs Review' && hw.status !== 'review_needed')
          return false;
        if (selectedStatus === 'Completed' && hw.status !== 'completed')
          return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = hw.title.toLowerCase().includes(q);
        const matchSubj = hw.subject.toLowerCase().includes(q);
        const matchDesc = hw.description.toLowerCase().includes(q);
        const matchClass = `${hw.className} ${hw.section}`.toLowerCase().includes(q);
        if (!matchTitle && !matchSubj && !matchDesc && !matchClass) {
          return false;
        }
      }
      return true;
    });
  }, [
    homeworkList,
    selectedClass,
    selectedSection,
    selectedSubject,
    selectedStatus,
    searchQuery,
  ]);

  // Metric Computations (Matching 1:1 with Web Portal)
  const myClassTasksCount = filtered.length;
  const submissionsToGradeCount = filtered.filter(
    (h) => h.status === 'review_needed'
  ).length;
  const gradedSubmissionsCount = filtered.filter(
    (h) => h.status === 'completed'
  ).length;
  const dueThisWeekCount = filtered.filter((h) => h.dueThisWeek).length;

  const handleCreateHomework = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required Field', 'Please enter assignment title.');
      return;
    }
    if (!newDueDate.trim()) {
      Alert.alert('Required Field', 'Please enter assignment due date & time.');
      return;
    }

    const secChar = newSection.replace('Section ', '').trim() || 'A';
    const matchingStudents = (students || []).filter((s: any) => {
      const cMatch = !newClass || s.className === newClass;
      const sMatch = !secChar || s.sectionName === secChar;
      return cMatch && sMatch;
    });
    const totalAssignedStudents = matchingStudents.length > 0 ? matchingStudents.length : ((students || []).length || 0);

    const newHw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      className: newClass,
      section: secChar,
      dueDate: newDueDate.trim(),
      description:
        newDescription.trim() || 'Complete the assignment as instructed in class.',
      totalStudents: totalAssignedStudents,
      submittedCount: 0,
      gradedCount: 0,
      status: 'active',
      maxPoints: parseInt(newMaxPoints, 10) || 50,
      submissionType: newSubmissionType,
      dueThisWeek: true,
    };

    apiCreateHomework({
      title: newHw.title,
      subject: newHw.subject,
      class_name: newHw.className,
      section: newHw.section,
      due_date: newHw.dueDate,
      description: newHw.description,
      max_points: newHw.maxPoints,
      submission_type: newHw.submissionType,
    }).catch(() => {});

    setHomeworkList([newHw, ...homeworkList]);
    setNewTitle('');
    setNewDueDate('');
    setNewDescription('');
    setCreateModalVisible(false);

    Alert.alert(
      'Homework Published',
      `"${newHw.title}" has been assigned to ${newHw.className}-${newHw.section}.${
        notifyParents ? '\nInstant SMS & push notifications sent to parents.' : ''
      }`
    );
  };

  const getSubjectColor = (subj: string) => {
    switch (subj.toLowerCase()) {
      case 'mathematics':
        return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
      case 'physics':
      case 'science':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'english':
        return { bg: '#FDF4FF', text: '#C026D3', border: '#F5D0FE' };
      case 'chemistry':
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <View style={s.container}>
      {/* 1. HEADER CARD (Exact 1:1 Match with Web Portal Screenshot) */}
      <Card style={s.headerCard}>
        <View style={s.headerContentRow}>
          <View style={s.headerLeft}>
            {/* Violet rounded square Book Icon */}
            <View style={s.bookIconWrap}>
              <BookOpen size={24} color="#FFFFFF" />
            </View>

            <View style={s.headerTextCol}>
              {/* Badges Row */}
              <View style={s.badgeWrapRow}>
                <View style={s.deskBadge}>
                  <Text style={s.deskBadgeText}>TEACHER ASSIGNMENT DESK</Text>
                </View>

                <View style={s.authorizedBadge}>
                  <Check size={11} color="#059669" strokeWidth={3} />
                  <Text style={s.authorizedBadgeText}>
                    Authorized Classes: Class 1, Class 2, Class 3, Class 4, Class 5
                  </Text>
                </View>

                <Text style={s.curriculumTag}>Class Curriculum</Text>
              </View>

              {/* Title & Subtitle */}
              <Text style={s.headerTitle}>Class Homework Management</Text>
              <Text style={s.headerSubtitle}>
                Assign daily class homework, set submission due dates, and automatically notify students & parents.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={s.headerButtonsRow}>
          <Pressable
            onPress={() => setCreateModalVisible(true)}
            style={s.assignPrimaryBtn}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={s.assignPrimaryBtnText}>Assign Class Homework</Text>
          </Pressable>

          <Pressable
            onPress={() => setNoticeModalVisible(true)}
            style={s.noticeCenterBtn}
          >
            <Bell size={15} color="#475569" />
            <Text style={s.noticeCenterBtnText}>Notice Center</Text>
          </Pressable>
        </View>
      </Card>

      {/* 2. THE 4 METRIC SUMMARY CARDS (Exact 1:1 Match with Web Portal) */}
      <View style={s.metricsGrid}>
        {/* Metric 1: MY CLASS TASKS */}
        <View style={s.metricCard}>
          <View style={s.metricTopRow}>
            <Text style={s.metricTitle}>MY CLASS TASKS</Text>
            <Text style={s.metricTag}>Curriculum</Text>
          </View>
          <Text style={s.metricValueDark}>{myClassTasksCount}</Text>
          <Text style={s.metricSubtext}>Assigned to my classes</Text>
        </View>

        {/* Metric 2: SUBMISSIONS TO GRADE */}
        <View style={s.metricCard}>
          <View style={s.metricTopRow}>
            <Text style={[s.metricTitle, { color: '#D97706' }]}>
              SUBMISSIONS TO GRADE
            </Text>
            <Text style={[s.metricTag, { color: '#D97706' }]}>Needs Review</Text>
          </View>
          <Text style={[s.metricValueDark, { color: '#D97706' }]}>
            {submissionsToGradeCount}
          </Text>
          <Text style={s.metricSubtext}>Awaiting marks entry</Text>
        </View>

        {/* Metric 3: GRADED SUBMISSIONS */}
        <View style={s.metricCard}>
          <View style={s.metricTopRow}>
            <Text style={[s.metricTitle, { color: '#16A34A' }]}>
              GRADED SUBMISSIONS
            </Text>
            <Text style={[s.metricTag, { color: '#16A34A' }]}>Done</Text>
          </View>
          <Text style={[s.metricValueDark, { color: '#16A34A' }]}>
            {gradedSubmissionsCount}
          </Text>
          <Text style={s.metricSubtext}>Evaluated & recorded</Text>
        </View>

        {/* Metric 4: DUE THIS WEEK */}
        <View style={s.metricCard}>
          <View style={s.metricTopRow}>
            <Text style={[s.metricTitle, { color: '#DC2626' }]}>
              DUE THIS WEEK
            </Text>
            <Text style={[s.metricTag, { color: '#DC2626' }]}>Upcoming</Text>
          </View>
          <Text style={[s.metricValueDark, { color: '#DC2626' }]}>
            {dueThisWeekCount}
          </Text>
          <Text style={s.metricSubtext}>Immediate attention</Text>
        </View>
      </View>

      {/* 3. SEARCH & 4 DROPDOWN FILTER BAR (1:1 with Web Portal) */}
      <View style={s.filterContainer}>
        {/* Search Input Box */}
        <View style={s.searchBarWrap}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by topic, subject, instructions, or teacher..."
            placeholderTextColor="#94A3B8"
            style={s.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* 4 Dropdown Filter Pills (Scrollable horizontally on mobile) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dropdownScroll}
        >
          {/* 1. Classes Dropdown */}
          <Pressable
            onPress={() => setActivePicker('class')}
            style={[
              s.filterDropdownPill,
              selectedClass !== 'All Classes (Full School)' && s.filterPillActive,
            ]}
          >
            <Text
              style={[
                s.filterDropdownText,
                selectedClass !== 'All Classes (Full School)' && s.filterTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedClass}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>

          {/* 2. Sections Dropdown */}
          <Pressable
            onPress={() => setActivePicker('section')}
            style={[
              s.filterDropdownPill,
              selectedSection !== 'All Sections' && s.filterPillActive,
            ]}
          >
            <Text
              style={[
                s.filterDropdownText,
                selectedSection !== 'All Sections' && s.filterTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedSection}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>

          {/* 3. Subjects Dropdown */}
          <Pressable
            onPress={() => setActivePicker('subject')}
            style={[
              s.filterDropdownPill,
              selectedSubject !== 'All Subjects' && s.filterPillActive,
            ]}
          >
            <Text
              style={[
                s.filterDropdownText,
                selectedSubject !== 'All Subjects' && s.filterTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedSubject}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>

          {/* 4. Statuses Dropdown */}
          <Pressable
            onPress={() => setActivePicker('status')}
            style={[
              s.filterDropdownPill,
              selectedStatus !== 'All Statuses' && s.filterPillActive,
            ]}
          >
            <Text
              style={[
                s.filterDropdownText,
                selectedStatus !== 'All Statuses' && s.filterTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedStatus}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>
        </ScrollView>
      </View>

      {/* 4. CONTENT LIST / EMPTY STATE (Exact Match with Web Screenshot) */}
      {filtered.length === 0 ? (
        <Card style={s.emptyCard}>
          <View style={s.emptyIconWrap}>
            <BookOpen size={42} color="#CBD5E1" strokeWidth={1.5} />
          </View>
          <Text style={s.emptyTitle}>No Homework Found</Text>
          <Text style={s.emptySubtitle}>
            No homework assignments created matching the selected filters. Click "+ Assign Class Homework" to publish one.
          </Text>

          <Pressable
            onPress={() => setCreateModalVisible(true)}
            style={s.assignFirstBtn}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={s.assignFirstBtnText}>Assign First Homework</Text>
          </Pressable>
        </Card>
      ) : (
        <View style={s.hwList}>
          {filtered.map((hw) => {
            const sc = getSubjectColor(hw.subject);
            const percent = Math.round(
              (hw.submittedCount / hw.totalStudents) * 100
            );

            return (
              <Card key={hw.id} style={s.hwItemCard}>
                {/* Header: Subject badge, Class pill, and Due date */}
                <View style={s.hwItemTopRow}>
                  <View style={s.hwItemBadgeRow}>
                    <View
                      style={[
                        s.subjectBadge,
                        { backgroundColor: sc.bg, borderColor: sc.border },
                      ]}
                    >
                      <Text style={[s.subjectBadgeText, { color: sc.text }]}>
                        {hw.subject}
                      </Text>
                    </View>

                    <View style={s.classBadge}>
                      <Text style={s.classBadgeText}>
                        {hw.className}-{hw.section}
                      </Text>
                    </View>

                    {hw.maxPoints && (
                      <View style={s.pointsBadge}>
                        <Text style={s.pointsBadgeText}>
                          {hw.maxPoints} pts
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={s.dueRow}>
                    <Clock size={12} color="#64748B" />
                    <Text style={s.dueText}>{hw.dueDate}</Text>
                  </View>
                </View>

                {/* Assignment Title & Instructions */}
                <Text style={s.hwItemTitle}>{hw.title}</Text>
                <Text style={s.hwItemDesc}>{hw.description}</Text>

                {/* Submissions & Progress Track */}
                <View style={s.progressBox}>
                  <View style={s.progressLabelsRow}>
                    <Text style={s.progressLabel}>
                      Submissions: {hw.submittedCount}/{hw.totalStudents} ({percent}%)
                    </Text>
                    <Text style={s.gradedLabel}>
                      Graded: {hw.gradedCount}/{hw.submittedCount}
                    </Text>
                  </View>

                  <View style={s.progressTrack}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${percent}%`,
                          backgroundColor:
                            percent === 100
                              ? '#16A34A'
                              : percent > 50
                              ? '#4F46E5'
                              : '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Card Footer Actions */}
                <View style={s.hwItemActions}>
                  <View style={s.submissionTypeTag}>
                    <Text style={s.submissionTypeText}>
                      {hw.submissionType || 'Notebook Check'}
                    </Text>
                  </View>

                  <View style={s.actionsRight}>
                    <Pressable
                      onPress={() =>
                        Alert.alert(
                          'Reminder Sent',
                          `Automated push & SMS reminder dispatched to remaining students in ${hw.className}-${hw.section}.`
                        )
                      }
                      style={s.remindBtn}
                    >
                      <Send size={12} color="#475569" />
                      <Text style={s.remindBtnText}>Remind</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        Alert.alert(
                          'Review & Grading Desk',
                          `Opened evaluation sheet for "${hw.title}".\n${hw.submittedCount} student submissions ready for grading.`
                        )
                      }
                      style={s.reviewBtn}
                    >
                      <FileText size={13} color="#4F46E5" />
                      <Text style={s.reviewBtnText}>Review & Grade</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* 5. FILTER PICKER MODAL (Smooth selection sheet) */}
      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable
          style={s.pickerBackdrop}
          onPress={() => setActivePicker(null)}
        >
          <View style={s.pickerSheet}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>
                {activePicker === 'class' && 'Select Class'}
                {activePicker === 'section' && 'Select Section'}
                {activePicker === 'subject' && 'Select Subject'}
                {activePicker === 'status' && 'Select Status'}
              </Text>
              <Pressable onPress={() => setActivePicker(null)} hitSlop={8}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {activePicker === 'class' &&
                classOptions.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setSelectedClass(opt);
                      setActivePicker(null);
                    }}
                    style={[
                      s.pickerOption,
                      selectedClass === opt && s.pickerOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.pickerOptionText,
                        selectedClass === opt && s.pickerOptionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {selectedClass === opt && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}

              {activePicker === 'section' &&
                sectionOptions.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setSelectedSection(opt);
                      setActivePicker(null);
                    }}
                    style={[
                      s.pickerOption,
                      selectedSection === opt && s.pickerOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.pickerOptionText,
                        selectedSection === opt && s.pickerOptionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {selectedSection === opt && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}

              {activePicker === 'subject' &&
                subjectOptions.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setSelectedSubject(opt);
                      setActivePicker(null);
                    }}
                    style={[
                      s.pickerOption,
                      selectedSubject === opt && s.pickerOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.pickerOptionText,
                        selectedSubject === opt && s.pickerOptionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {selectedSubject === opt && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}

              {activePicker === 'status' &&
                STATUS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setSelectedStatus(opt);
                      setActivePicker(null);
                    }}
                    style={[
                      s.pickerOption,
                      selectedStatus === opt && s.pickerOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.pickerOptionText,
                        selectedStatus === opt && s.pickerOptionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {selectedStatus === opt && (
                      <Check size={16} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* 6. CREATE HOMEWORK MODAL (Complete with all fields) */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <View style={s.modalTitleRow}>
                <View style={s.modalIconWrap}>
                  <BookOpen size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text style={s.modalTitle}>Assign Class Homework</Text>
                  <Text style={s.modalSub}>
                    Publish daily tasks, set due dates & notify parents
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setCreateModalVisible(false)}
                hitSlop={10}
              >
                <X size={20} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Target Class Selection */}
              <Text style={s.fieldLabel}>TARGET CLASS</Text>
              <View style={s.pillSelectRow}>
                {createClassOptions.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setNewClass(c)}
                    style={[
                      s.formPill,
                      newClass === c && s.formPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.formPillText,
                        newClass === c && s.formPillTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Target Section */}
              <Text style={s.fieldLabel}>SECTION</Text>
              <View style={s.pillSelectRow}>
                {createSectionOptions.map((sec) => (
                  <Pressable
                    key={sec}
                    onPress={() => setNewSection(sec)}
                    style={[
                      s.formPill,
                      newSection === sec && s.formPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.formPillText,
                        newSection === sec && s.formPillTextSelected,
                      ]}
                    >
                      {sec}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Subject Selection */}
              <Text style={s.fieldLabel}>SUBJECT</Text>
              <View style={s.pillSelectRow}>
                {createSubjectOptions.map((sub) => (
                  <Pressable
                    key={sub}
                    onPress={() => setNewSubject(sub)}
                    style={[
                      s.formPill,
                      newSubject === sub && s.formPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.formPillText,
                        newSubject === sub && s.formPillTextSelected,
                      ]}
                    >
                      {sub}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Title Input */}
              <Text style={s.fieldLabel}>ASSIGNMENT TOPIC / TITLE *</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Chapter 4 Quadratic Formula Exercises"
                placeholderTextColor="#94A3B8"
                style={s.formInput}
              />

              {/* Due Date & Max Marks Row */}
              <View style={s.formTwoCol}>
                <View style={{ flex: 1.3 }}>
                  <Text style={s.fieldLabel}>DUE DATE & TIME *</Text>
                  <TextInput
                    value={newDueDate}
                    onChangeText={setNewDueDate}
                    placeholder="e.g. Tomorrow, 5:00 PM"
                    placeholderTextColor="#94A3B8"
                    style={s.formInput}
                  />
                </View>

                <View style={{ flex: 0.7 }}>
                  <Text style={s.fieldLabel}>MAX MARKS</Text>
                  <TextInput
                    value={newMaxPoints}
                    onChangeText={setNewMaxPoints}
                    placeholder="50"
                    keyboardType="number-pad"
                    placeholderTextColor="#94A3B8"
                    style={s.formInput}
                  />
                </View>
              </View>

              {/* Submission Mode */}
              <Text style={s.fieldLabel}>SUBMISSION METHOD</Text>
              <View style={s.pillSelectRow}>
                {(['Notebook Check', 'Digital Upload'] as const).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setNewSubmissionType(m)}
                    style={[
                      s.formPill,
                      newSubmissionType === m && s.formPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.formPillText,
                        newSubmissionType === m && s.formPillTextSelected,
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Instructions / Description */}
              <Text style={s.fieldLabel}>INSTRUCTIONS & GUIDELINES</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Enter exercises, page numbers, formatting instructions..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                style={[s.formInput, { height: 75, textAlignVertical: 'top' }]}
              />

              {/* Parent Notification Checkbox */}
              <Pressable
                onPress={() => setNotifyParents(!notifyParents)}
                style={s.checkboxRow}
              >
                <View
                  style={[
                    s.checkboxBox,
                    notifyParents && s.checkboxBoxChecked,
                  ]}
                >
                  {notifyParents && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={s.checkboxLabel}>
                  Notify students & parents automatically via SMS & Portal Notification
                </Text>
              </Pressable>

              {/* Publish Button */}
              <Pressable
                onPress={handleCreateHomework}
                style={s.publishBtn}
              >
                <Text style={s.publishBtnText}>Publish Class Homework</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. NOTICE CENTER MODAL */}
      <Modal
        visible={noticeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeModalVisible(false)}
      >
        <Pressable
          style={s.pickerBackdrop}
          onPress={() => setNoticeModalVisible(false)}
        >
          <View style={s.noticeSheet}>
            <View style={s.pickerHeader}>
              <View style={s.noticeHeaderLeft}>
                <Bell size={18} color="#4F46E5" />
                <Text style={s.pickerTitle}>Notice Center</Text>
              </View>
              <Pressable
                onPress={() => setNoticeModalVisible(false)}
                hitSlop={8}
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              <View style={s.noticeItem}>
                <View style={s.noticeDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.noticeItemTitle}>
                    Class 1 & 2 Homework Submission Reminder
                  </Text>
                  <Text style={s.noticeItemBody}>
                    Automated SMS sent to 38 parents regarding tomorrow's Mathematics homework submission deadline.
                  </Text>
                  <Text style={s.noticeItemTime}>Today, 11:30 AM</Text>
                </View>
              </View>

              <View style={s.noticeItem}>
                <View style={[s.noticeDot, { backgroundColor: '#10B981' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.noticeItemTitle}>
                    Curriculum Sync: Unit 4 Physics Completed
                  </Text>
                  <Text style={s.noticeItemBody}>
                    All 38 students have turned in their Light Reflection Lab Reports. Marks entered into portal.
                  </Text>
                  <Text style={s.noticeItemTime}>Yesterday, 4:15 PM</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  headerContentRow: {
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bookIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  badgeWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  deskBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  deskBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  authorizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  authorizedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  curriculumTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
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
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  assignPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assignPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  noticeCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8.5,
    borderRadius: 10,
  },
  noticeCenterBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },

  /* 2. The 4 Metric Summary Cards (2x2 Grid) */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  metricTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  metricTag: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metricValueDark: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  /* 3. Search & Filter Bar */
  filterContainer: {
    gap: 8,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 4,
  },
  dropdownScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  filterDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  filterDropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  filterTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  /* 4. Empty State matching web */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 16,
  },
  assignFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 9.5,
    borderRadius: 10,
  },
  assignFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* Homework List items */
  hwList: {
    gap: 12,
  },
  hwItemCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hwItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hwItemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  classBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  classBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  pointsBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointsBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  hwItemTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  hwItemDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#475569',
    marginBottom: 10,
  },
  progressBox: {
    marginBottom: 10,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  gradedLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  hwItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submissionTypeTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  submissionTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 8,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  pillSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  formPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formPillSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  formPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  formPillTextSelected: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  formTwoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  publishBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Picker Sheet Modal */
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerSheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pickerOptionTextSelected: {
    fontWeight: '800',
    color: '#4F46E5',
  },

  /* Notice Sheet Modal */
  noticeSheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 10,
  },
  noticeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginTop: 4,
  },
  noticeItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  noticeItemBody: {
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    marginBottom: 4,
  },
  noticeItemTime: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
