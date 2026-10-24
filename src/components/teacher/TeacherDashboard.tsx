import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  Grid, Users, GraduationCap, BookOpen, CheckSquare, Receipt, FolderCheck, FileText, MessageSquare, Globe2,
} from 'lucide-react-native';
import type { User } from '../../types/auth';
import { PortalShell, PortalNavItem, LoadingView } from '../common';
import { CYCLE_LABEL, SALARY_YEAR } from '../../utils/constants';
import { useTeacherPortalData, useTeacherSubjects } from './hooks/useTeacherPortalData';
import { apiGetNotifications, apiGetConversations } from '../../services/schoolApi';
import { chatSocket } from '../../services/chatSocket';
import {
  useNotificationReadStore,
  DEFAULT_NOTIFICATIONS,
  formatBadgeCount,
} from '../../services/notificationStore';
import { TeacherHomeTab } from './tabs/TeacherHomeTab';
import { TeacherStudentsTab } from './tabs/TeacherStudentsTab';
import { TeacherAcademicTab } from './tabs/TeacherAcademicTab';
import { TeacherHomeworkTab } from './tabs/TeacherHomeworkTab';
import { TeacherAttendanceTab } from './tabs/TeacherAttendanceTab';
import { TeacherSalaryTab } from './tabs/TeacherSalaryTab';
import { TeacherDocumentsTab } from './tabs/TeacherDocumentsTab';
import { TeacherExamsTab } from './tabs/TeacherExamsTab';
import { TeacherCommsTab } from './tabs/TeacherCommsTab';
import { TeacherEventsTab } from './tabs/TeacherEventsTab';

export type TeacherNavTab =
  | 'dashboard' | 'student' | 'academic' | 'homework' | 'attendance' | 'salary-details'
  | 'teacher-documents' | 'exams' | 'communication' | 'community-events';

const TEACHER_NAV_ITEMS: PortalNavItem<TeacherNavTab>[] = [
  { id: 'dashboard', label: 'Teacher Dashboard', icon: Grid },
  { id: 'student', label: 'Student Directory', icon: Users },
  { id: 'academic', label: 'Academic Schedules', icon: GraduationCap },
  { id: 'homework', label: 'Class Homework', icon: BookOpen },
  { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
  { id: 'salary-details', label: 'Salary Details', icon: Receipt },
  { id: 'teacher-documents', label: 'My Documents', icon: FolderCheck },
  { id: 'exams', label: 'Exams & Grading', icon: FileText },
  { id: 'communication', label: 'Communications', icon: MessageSquare },
  { id: 'community-events', label: 'Community & Events', icon: Globe2 },
];

const BREADCRUMB_MAP: Record<TeacherNavTab, string> = {
  dashboard: 'Dashboard', student: 'Students', academic: 'Academic', homework: 'Homework', attendance: 'Attendance',
  'salary-details': 'Salary Details', 'teacher-documents': 'Teacher Documents', exams: 'Exams',
  communication: 'Comms', 'community-events': 'Events',
};

interface TeacherDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
}

export function TeacherDashboard({
  currentUser,
  onLogout,
  onOpenChat,
  onOpenNotifications,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TeacherNavTab>('dashboard');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {
    loading, teacherProfile, teachers, assignments, subjects, slots, students,
    salaries, documents, setDocuments, exams, events, setEvents,
    notifs, setNotifs, leaveRequests, setLeaveRequests, refetch,
  } = useTeacherPortalData(currentUser);
  const visibleSubjects = useTeacherSubjects(subjects, assignments);

  const handleTabChange = (tab: TeacherNavTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const reloadNotifs = async () => {
    try {
      const res = await apiGetNotifications();
      setNotifs(res && res.length > 0 ? res : DEFAULT_NOTIFICATIONS);
    } catch {
      setNotifs(DEFAULT_NOTIFICATIONS);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        reloadNotifs(),
      ]);
    } catch (e) {
      console.warn('Teacher refresh error:', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  }, [refetch]);

  // Unread conversations (people) count for sidebar badge: 1, 2, ... 10+
  const [unreadPeopleCount, setUnreadPeopleCount] = useState<number>(0);

  const fetchUnreadConversations = useCallback(async () => {
    try {
      const convs = await apiGetConversations();
      if (convs && Array.isArray(convs)) {
        const count = convs.filter(
          (c) => ((c.unreadCount || (c as any).unread_count || 0) > 0)
        ).length;
        setUnreadPeopleCount(count);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadConversations();

    chatSocket.connect();
    const unsubMsg = chatSocket.on('message.created', () => {
      fetchUnreadConversations();
    });
    const unsubRead = chatSocket.on('conversation.read', () => {
      fetchUnreadConversations();
    });
    const unsubUnread = chatSocket.on('unread_count.updated', () => {
      fetchUnreadConversations();
    });

    return () => {
      unsubMsg();
      unsubRead();
      unsubUnread();
    };
  }, [fetchUnreadConversations]);

  const { isRead, readVersion } = useNotificationReadStore();

  const effectiveNotifs = notifs && notifs.length > 0 ? notifs : DEFAULT_NOTIFICATIONS;

  const unreadEventsCount = React.useMemo(() => {
    return (effectiveNotifs || []).filter((n) => !isRead(n)).length;
  }, [effectiveNotifs, isRead, readVersion]);

  const navItems = React.useMemo(() => {
    const commBadge = formatBadgeCount(unreadPeopleCount);
    const eventsBadge = formatBadgeCount(unreadEventsCount);

    return TEACHER_NAV_ITEMS.map((item) => {
      if (item.id === 'communication') {
        return {
          ...item,
          badge: commBadge,
        };
      }
      if (item.id === 'community-events') {
        return {
          ...item,
          badge: eventsBadge,
        };
      }
      return item;
    });
  }, [unreadPeopleCount, unreadEventsCount]);

  // The Communication tab must fill the full content area (no ScrollView padding).
  const isCommsTab = activeTab === 'communication';

  return (
    <PortalShell
      items={navItems}
      activeTab={activeTab}
      onSelectTab={handleTabChange}
      userRole="TEACHER"
      breadcrumbLabel={BREADCRUMB_MAP[activeTab] || 'Dashboard'}
      userName={currentUser.name || 'Teacher'}
      onLogout={onLogout}
      cycleText={CYCLE_LABEL}
      onPressNotifications={onOpenNotifications}
    >
      {/* Communications tab: full-screen, no ScrollView padding */}
      {isCommsTab ? (
        <View style={styles.fullScreenTab}>
          {loading ? (
            <LoadingView message="Loading faculty academic desk..." color="#6366F1" />
          ) : (
            <TeacherCommsTab
              currentUser={currentUser}
              students={students}
              onUnreadCountChange={setUnreadPeopleCount}
            />
          )}
        </View>
      ) : (
        /* All other tabs: padded scrollable area */
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6366F1', '#4F46E5']}
              tintColor="#6366F1"
              title="Reloading academic desk..."
              titleColor="#64748B"
            />
          }
        >
          {loading ? (
            <LoadingView message="Loading faculty academic desk..." color="#6366F1" />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <TeacherHomeTab
                  userName={currentUser.name}
                  slots={slots}
                  visibleSubjects={visibleSubjects}
                  students={students}
                  teachers={teachers}
                  leaveRequests={leaveRequests}
                  exams={exams}
                  salaries={salaries}
                  notifs={notifs}
                  teacherProfile={teacherProfile}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  onNavigate={(t) => handleTabChange(t as TeacherNavTab)}
                />
              )}
              {activeTab === 'student' && <TeacherStudentsTab students={students} />}
              {activeTab === 'academic' && (
                <TeacherAcademicTab
                  slots={slots}
                  teacherName={teacherProfile?.name || currentUser.name || 'Teacher'}
                  visibleSubjects={visibleSubjects}
                />
              )}
              {activeTab === 'homework' && (
                <TeacherHomeworkTab
                  userName={currentUser.name}
                  students={students}
                  slots={slots}
                />
              )}
              {activeTab === 'attendance' && <TeacherAttendanceTab students={students} />}
              {activeTab === 'salary-details' && (
                <TeacherSalaryTab profile={teacherProfile} salaries={salaries} year={SALARY_YEAR} />
              )}
              {activeTab === 'teacher-documents' && (
                <TeacherDocumentsTab
                  teacherId={teacherProfile?.id || currentUser.id || 0}
                  documents={documents}
                  onChanged={setDocuments}
                  profile={teacherProfile}
                  currentUser={currentUser}
                />
              )}
              {activeTab === 'exams' && (
                <TeacherExamsTab
                  schedules={exams}
                  students={students}
                  teacherName={teacherProfile?.name || currentUser.name || 'Teacher'}
                />
              )}
              {activeTab === 'community-events' && (
                <TeacherEventsTab
                  events={events}
                  onChanged={setEvents}
                  userName={currentUser.name}
                  leaveRequests={leaveRequests}
                  onLeaveAdded={(r) => setLeaveRequests((p) => [r, ...p])}
                  notifs={notifs}
                  onNotifAdded={reloadNotifs}
                  students={students}
                />
              )}
            </>
          )}
        </ScrollView>
      )}
    </PortalShell>
  );
}

const styles = StyleSheet.create({
  scrollArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  // Full screen container for tabs that need to fill entire content area
  fullScreenTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
