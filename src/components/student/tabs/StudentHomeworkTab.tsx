import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import {
  BookOpen,
  Bell,
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';

export function StudentHomeworkTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const SUBJECT_OPTIONS = [
    'All Subjects',
    'Avengers',
    'Batman',
    'Black Panter',
    'Chaddi Man',
    'Computer science',
    'Ironman',
    'Kannada',
    'Superman',
  ];

  const STATUS_OPTIONS = [
    'All Statuses',
    'Pending',
    'Completed',
    'Overdue',
  ];

  const handleNoticeCenter = () => {
    Alert.alert(
      'Notice Center',
      'All academic notices, homework announcements, and broadcasts are up-to-date.'
    );
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER (1:1 with Web Screenshot)           */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <BookOpen size={22} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.deskBadge}>
                <Text style={styles.deskBadgeText}>STUDENT HOMEWORK DESK</Text>
              </View>
              <Text style={styles.curriculumText}>Class Curriculum</Text>
            </View>
            <Text style={styles.bannerTitle}>My Class Homework & Assignments</Text>
            <Text style={styles.bannerSubtitle}>
              Track daily homework assigned by your teachers for Class Class 1 (A).
            </Text>
          </View>
        </View>

        {/* Notice Center Action Button */}
        <View style={styles.actionsBar}>
          <Pressable style={styles.noticeBtn} onPress={handleNoticeCenter}>
            <Bell size={14} color="#475569" />
            <Text style={styles.noticeBtnText}>Notice Center</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. FOUR STAT METRIC CARDS (1:1 with Web Screenshot)      */}
      {/* ======================================================== */}
      <View style={styles.metricsGrid}>
        {/* Card 1: ASSIGNED TASKS */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabel} numberOfLines={1}>ASSIGNED TASKS</Text>
            <Text style={styles.metricTagGray}>Curriculum</Text>
          </View>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricSub}>Active academic syllabus</Text>
        </View>

        {/* Card 2: PENDING TO-DO */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#D97706' }]} numberOfLines={1}>PENDING TO-DO</Text>
            <Text style={[styles.metricTagGray, { color: '#D97706' }]}>Pending</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#D97706' }]}>0</Text>
          <Text style={styles.metricSub}>Requires completion</Text>
        </View>

        {/* Card 3: COMPLETED / SUBMITTED */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#16A34A' }]} numberOfLines={1}>COMPLETED / SUBMITTED</Text>
            <Text style={[styles.metricTagGray, { color: '#16A34A' }]}>Done</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#16A34A' }]}>0</Text>
          <Text style={styles.metricSub}>Finished & submitted</Text>
        </View>

        {/* Card 4: URGENT DEADLINES */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#DC2626' }]} numberOfLines={1}>URGENT DEADLINES</Text>
            <Text style={[styles.metricTagGray, { color: '#DC2626' }]}>Upcoming</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>0</Text>
          <Text style={styles.metricSub}>Immediate attention</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTER CONTROLS (1:1 with Web Screenshot)    */}
      {/* ======================================================== */}
      <View style={styles.searchSection}>
        {/* Search Input Box */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic, subject, instructions, or teacher..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Dropdown Pills */}
        <View style={styles.filtersRow}>
          <Pressable
            style={styles.filterBtn}
            onPress={() => {
              setShowSubjectMenu(!showSubjectMenu);
              setShowStatusMenu(false);
            }}
          >
            <Text style={styles.filterBtnText} numberOfLines={1}>
              {selectedSubject}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>

          <Pressable
            style={styles.filterBtn}
            onPress={() => {
              setShowStatusMenu(!showStatusMenu);
              setShowSubjectMenu(false);
            }}
          >
            <Text style={styles.filterBtnText} numberOfLines={1}>
              {selectedStatus}
            </Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>
        </View>

        {/* Dropdown Options for Subjects */}
        {showSubjectMenu && (
          <View style={styles.dropdownBox}>
            {SUBJECT_OPTIONS.map((sub) => (
              <Pressable
                key={sub}
                style={[
                  styles.dropdownItem,
                  selectedSubject === sub && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedSubject(sub);
                  setShowSubjectMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedSubject === sub && styles.dropdownItemTextActive,
                  ]}
                >
                  {sub}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Dropdown Options for Status */}
        {showStatusMenu && (
          <View style={styles.dropdownBox}>
            {STATUS_OPTIONS.map((st) => (
              <Pressable
                key={st}
                style={[
                  styles.dropdownItem,
                  selectedStatus === st && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedStatus(st);
                  setShowStatusMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedStatus === st && styles.dropdownItemTextActive,
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 4. EMPTY HOMEWORK STATE (1:1 with Web Screenshot)        */}
      {/* ======================================================== */}
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconBox}>
          <BookOpen size={46} color="#94A3B8" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No Homework Found</Text>
        <Text style={styles.emptySubtitle}>
          No active homework assignments for your class right now. Enjoy your free time or check back later!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // 1. Header Banner
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
    gap: 12,
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
  deskBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  deskBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  curriculumText: {
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
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  noticeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // 2. Metric Cards Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.2,
    flex: 1,
  },
  metricTagGray: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
  },

  // 3. Search & Filter Bar
  searchSection: {
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    padding: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    flex: 1,
  },
  dropdownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownItemTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // 4. Empty State Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  emptyIconBox: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
});
