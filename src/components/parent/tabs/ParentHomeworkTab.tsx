import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  BookOpen,
  Bell,
  Search,
  ChevronDown,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import type { ParentNavTab } from '../ParentDashboard';

interface ParentHomeworkTabProps {
  wards: Student[];
  selectedWardId: number | 'all';
  onSelectWard: (id: number | 'all') => void;
  onNavigate?: (tab: ParentNavTab) => void;
}

export function ParentHomeworkTab({
  wards,
  selectedWardId,
  onSelectWard,
  onNavigate,
}: ParentHomeworkTabProps) {
  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const wardName = activeWard?.name || 'ganesh';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const SUBJECTS = [
    'All Subjects',
    'Avengers',
    'Batman',
    'Black Panter',
    'Chaddi Man',
    'Computer science',
    'Ironman',
  ];

  const STATUSES = ['All Statuses', 'Pending', 'Submitted', 'Graded'];

  // In the web screenshot, Class 1-A has 0 active homework tasks matching Screenshot 1 & Screenshot 3
  const homeworkItems: Array<{
    id: number;
    title: string;
    subject: string;
    status: 'Pending' | 'Submitted';
    dueDate: string;
    teacher: string;
    instructions: string;
  }> = [];

  const filteredItems = useMemo(() => {
    return homeworkItems.filter((item) => {
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSubject =
        selectedSubject === 'All Subjects' || item.subject === selectedSubject;
      const matchStatus =
        selectedStatus === 'All Statuses' || item.status === selectedStatus;

      return matchQuery && matchSubject && matchStatus;
    });
  }, [homeworkItems, searchQuery, selectedSubject, selectedStatus]);

  const totalTasks = homeworkItems.length;
  const pendingTasks = homeworkItems.filter((h) => h.status === 'Pending').length;
  const completedTasks = homeworkItems.filter((h) => h.status === 'Submitted').length;
  const urgentTasks = 0;

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD (1:1 Web Portal Screenshot)           */}
      {/* ======================================================== */}
      <View style={styles.topCard}>
        {/* Top Header Row with Badge & Notice Center */}
        <View style={styles.topMetaRow}>
          <View style={styles.badgeRow}>
            <View style={styles.wardMonitorPill}>
              <Text style={styles.wardMonitorPillText}>PARENT WARD MONITOR</Text>
            </View>
            <Text style={styles.classCurriculumText}>Class Curriculum</Text>
          </View>

          {onNavigate && (
            <Pressable
              style={styles.noticeCenterBtn}
              onPress={() => onNavigate('notifications')}
            >
              <Bell size={12} color="#475569" />
              <Text style={styles.noticeCenterBtnText}>Notice Center</Text>
            </Pressable>
          )}
        </View>

        {/* Title Row with Book Icon */}
        <View style={styles.headerRow}>
          <View style={styles.bookIconBox}>
            <BookOpen size={24} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{wardName}’s Homework & Tasks</Text>
            <Text style={styles.headerSubtitle}>
              Stay updated on homework deadlines and review teacher instructions for {wardName}.
            </Text>
          </View>
        </View>

        {/* WARD SELECTOR (When user has multiple children) */}
        {wards.length > 1 && (
          <View style={styles.wardSelectorRow}>
            <Text style={styles.selectWardLabel}>SELECT WARD:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wardScroll}
            >
              {wards.map((w) => {
                const isSelected = w.id === activeWard?.id;
                return (
                  <Pressable
                    key={w.id}
                    style={[styles.wardPill, isSelected && styles.wardPillActive]}
                    onPress={() => onSelectWard(w.id)}
                  >
                    <GraduationCap
                      size={13}
                      color={isSelected ? '#4F46E5' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.wardPillText,
                        isSelected && styles.wardPillTextActive,
                      ]}
                    >
                      {w.name}
                    </Text>
                    <View style={styles.wardClassTag}>
                      <Text style={styles.wardClassTagText}>
                        {(w.className || 'Class 1').startsWith('Class')
                          ? `${w.className}-${w.sectionName || 'A'}`
                          : `Class ${w.className}-${w.sectionName || 'A'}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 2. STATS / METRICS ROW (4 Cards 1:1 with Screenshot)     */}
      {/* ======================================================== */}
      <View style={styles.statsGrid}>
        {/* Card 1: WARD TASKS */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{wardName.toUpperCase()} TASKS</Text>
          <View style={styles.statNumberRow}>
            <Text style={styles.statValueNeutral}>{totalTasks}</Text>
            <Text style={styles.statTagNeutral}>Curriculum</Text>
          </View>
          <Text style={styles.statSubNeutral}>Active academic syllabus</Text>
        </View>

        {/* Card 2: PENDING TO-DO */}
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: '#D97706' }]}>PENDING TO-DO</Text>
          <View style={styles.statNumberRow}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{pendingTasks}</Text>
            <Text style={[styles.statTag, { color: '#D97706' }]}>Pending</Text>
          </View>
          <Text style={styles.statSubNeutral}>Requires completion</Text>
        </View>

        {/* Card 3: COMPLETED / SUBMITTED */}
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: '#059669' }]}>COMPLETED / SUBMITTED</Text>
          <View style={styles.statNumberRow}>
            <Text style={[styles.statValue, { color: '#059669' }]}>{completedTasks}</Text>
            <Text style={[styles.statTag, { color: '#059669' }]}>Done</Text>
          </View>
          <Text style={styles.statSubNeutral}>Finished & submitted</Text>
        </View>

        {/* Card 4: URGENT DEADLINES */}
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: '#DC2626' }]}>URGENT DEADLINES</Text>
          <View style={styles.statNumberRow}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{urgentTasks}</Text>
            <Text style={[styles.statTag, { color: '#DC2626' }]}>Upcoming</Text>
          </View>
          <Text style={styles.statSubNeutral}>Immediate attention</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTER BAR (1:1 with Screenshot)             */}
      {/* ======================================================== */}
      <View style={styles.filterCard}>
        <View style={styles.filterBarRow}>
          {/* Search Input Box */}
          <View style={styles.searchInputBox}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by topic, subject, instructions, or teacher..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Pills Row */}
          <View style={styles.filterPillsRow}>
            {/* Subject Dropdown Pill */}
            <Pressable
              style={styles.dropdownPill}
              onPress={() => {
                setShowSubjectPicker(!showSubjectPicker);
                setShowStatusPicker(false);
              }}
            >
              <Text style={styles.dropdownPillText}>{selectedSubject}</Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>

            {/* Status Dropdown Pill */}
            <Pressable
              style={styles.dropdownPill}
              onPress={() => {
                setShowStatusPicker(!showStatusPicker);
                setShowSubjectPicker(false);
              }}
            >
              <Text style={styles.dropdownPillText}>{selectedStatus}</Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>
        </View>

        {/* Inline Subject Selector dropdown options */}
        {showSubjectPicker && (
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownMenuTitle}>Select Subject:</Text>
            <View style={styles.dropdownOptionsRow}>
              {SUBJECTS.map((sub) => (
                <Pressable
                  key={sub}
                  style={[
                    styles.menuOptionPill,
                    selectedSubject === sub && styles.menuOptionPillActive,
                  ]}
                  onPress={() => {
                    setSelectedSubject(sub);
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuOptionPillText,
                      selectedSubject === sub && styles.menuOptionPillTextActive,
                    ]}
                  >
                    {sub}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Inline Status Selector dropdown options */}
        {showStatusPicker && (
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownMenuTitle}>Select Status:</Text>
            <View style={styles.dropdownOptionsRow}>
              {STATUSES.map((st) => (
                <Pressable
                  key={st}
                  style={[
                    styles.menuOptionPill,
                    selectedStatus === st && styles.menuOptionPillActive,
                  ]}
                  onPress={() => {
                    setSelectedStatus(st);
                    setShowStatusPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuOptionPillText,
                      selectedStatus === st && styles.menuOptionPillTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT: NO HOMEWORK FOUND (1:1 Screenshot 3)    */}
      {/* ======================================================== */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <BookOpen size={48} color="#CBD5E1" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No Homework Found</Text>
          <Text style={styles.emptySubtitle}>
            No homework assignments found for your child matching the selected filters.
          </Text>
        </View>
      ) : (
        <View style={styles.homeworkList}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemSubject}>{item.subject}</Text>
                <View
                  style={[
                    styles.statusChip,
                    item.status === 'Pending'
                      ? styles.statusChipPending
                      : styles.statusChipSubmitted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: item.status === 'Pending' ? '#D97706' : '#059669' },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemInstructions}>{item.instructions}</Text>
              <View style={styles.itemMetaRow}>
                <View style={styles.metaCol}>
                  <Calendar size={12} color="#64748B" />
                  <Text style={styles.metaText}>Due: {item.dueDate}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaText}>Teacher: {item.teacher}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 32,
  },
  // 1. Top Card
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wardMonitorPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  wardMonitorPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  classCurriculumText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
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
    marginTop: 2,
  },
  noticeCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  noticeCenterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // Ward Selector
  wardSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  selectWardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  wardScroll: {
    flexDirection: 'row',
    gap: 8,
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
  wardClassTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardClassTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // 2. Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  statTagNeutral: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  statValueNeutral: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statSubNeutral: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  // 3. Filter Card
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  searchInputBox: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  dropdownPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  dropdownPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  dropdownMenu: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownMenuTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  dropdownOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  menuOptionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuOptionPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  menuOptionPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  menuOptionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // 4. Main Empty State Container (1:1 Screenshot 3)
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 54,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  emptyIconContainer: {
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 16,
  },

  // List (if items exist)
  homeworkList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSubject: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipPending: {
    backgroundColor: '#FEF3C7',
  },
  statusChipSubmitted: {
    backgroundColor: '#ECFDF5',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  itemInstructions: {
    fontSize: 11,
    color: '#475569',
  },
  itemMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#64748B',
  },
});
