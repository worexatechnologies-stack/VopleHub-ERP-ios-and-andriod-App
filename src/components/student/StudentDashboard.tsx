import React, { useState, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  Grid,
  GraduationCap,
  BookOpen,
  FolderCheck,
  FileText,
  Bell,
  CreditCard,
  Globe,
  Truck,
} from 'lucide-react-native';
import type { User } from '../../types/auth';
import { PortalShell, PortalNavItem, LoadingView } from '../common';
import { CYCLE_LABEL } from '../../utils/constants';
import { useStudentPortalData } from './hooks/useStudentPortalData';
import { useNotificationReadStore, formatBadgeCount } from '../../services/notificationStore';
import { StudentHomeTab } from './tabs/StudentHomeTab';
import { StudentAcademicTab } from './tabs/StudentAcademicTab';
import { StudentHomeworkTab } from './tabs/StudentHomeworkTab';
import { StudentDocumentsTab } from './tabs/StudentDocumentsTab';
import { StudentExamsTab } from './tabs/StudentExamsTab';
import { StudentCommsTab } from './tabs/StudentCommsTab';
import { StudentFeesTab } from './tabs/StudentFeesTab';
import { StudentEventsTab } from './tabs/StudentEventsTab';
import { StudentTransportTab } from './tabs/StudentTransportTab';

export type StudentNavTab =
  | 'dashboard'
  | 'academic'
  | 'homework'
  | 'student-documents'
  | 'exams'
  | 'communication'
  | 'fees'
  | 'community-events'
  | 'transport';

const STUDENT_NAV_ITEMS: PortalNavItem<StudentNavTab>[] = [
  { id: 'dashboard', label: 'Student Portal', icon: Grid },
  { id: 'academic', label: 'My Timetable', icon: GraduationCap },
  { id: 'homework', label: 'Class Homework', icon: BookOpen },
  { id: 'student-documents', label: 'My Documents', icon: FolderCheck },
  { id: 'exams', label: 'Datesheets & Reports', icon: FileText },
  { id: 'communication', label: 'Class Notices', icon: Bell },
  { id: 'fees', label: 'My School Fees', icon: CreditCard },
  { id: 'community-events', label: 'School Community', icon: Globe },
  { id: 'transport', label: 'Transport GPS', icon: Truck },
];

const BREADCRUMB_MAP: Record<StudentNavTab, string> = {
  dashboard: 'Dashboard',
  academic: 'Timetable',
  homework: 'Class Homework',
  'student-documents': 'Documents',
  exams: 'Exams',
  communication: 'Notices',
  fees: 'Fees',
  'community-events': 'Community',
  transport: 'Transport',
};

interface StudentDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenEvents?: () => void;
  onOpenNotifications?: () => void;
}

export function StudentDashboard({
  currentUser,
  onLogout,
  onOpenChat,
  onOpenEvents,
  onOpenNotifications,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<StudentNavTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const {
    studentId,
    loading,
    student,
    slots,
    docs,
    reloadDocs,
    subjects,
    events,
    setEvents,
    notifs,
    feeSummary,
    schedules,
    ticket,
    reportCards,
    refetch,
  } = useStudentPortalData(currentUser);

  const classLabel = student ? `${student.className}-${student.sectionName}` : 'Class 1-A';

  const handleTabChange = (tab: StudentNavTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch ? refetch() : Promise.resolve(),
        reloadDocs ? reloadDocs() : Promise.resolve(),
      ]);
    } catch (e) {
      console.warn('Failed to refresh student portal data', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  }, [refetch, reloadDocs]);

  const { isRead, readVersion } = useNotificationReadStore();

  const unreadNotifsCount = React.useMemo(() => {
    return (notifs || []).filter((n) => !isRead(n)).length;
  }, [notifs, isRead, readVersion]);

  const navItems = React.useMemo(() => {
    const notifsBadge = formatBadgeCount(unreadNotifsCount);

    return STUDENT_NAV_ITEMS.map((item) => {
      if (item.id === 'communication') {
        return {
          ...item,
          badge: notifsBadge,
        };
      }
      if (item.id === 'community-events') {
        return {
          ...item,
          badge: notifsBadge,
        };
      }
      return item;
    });
  }, [unreadNotifsCount]);

  return (
    <PortalShell
      items={navItems}
      activeTab={activeTab}
      onSelectTab={handleTabChange}
      userRole="STUDENT"
      breadcrumbLabel={BREADCRUMB_MAP[activeTab] || 'Dashboard'}
      userName={student?.name || currentUser.name || 'ganesh'}
      onLogout={onLogout}
      cycleText={CYCLE_LABEL}
      cleanTopBar={true}
      onPressNotifications={onOpenNotifications}
    >
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
            colors={['#4F46E5', '#2563EB']}
            tintColor="#4F46E5"
            title="Reloading student portal..."
            titleColor="#64748B"
          />
        }
      >
        {loading ? (
          <LoadingView message="Syncing live student portal..." color="#4F46E5" />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <StudentHomeTab
                student={student}
                userName={currentUser.name || 'ganesh'}
                slots={slots}
                docs={docs}
                subjects={subjects}
                reportCards={reportCards}
                feeSummary={feeSummary}
                onNavigate={handleTabChange}
              />
            )}
            {activeTab === 'academic' && (
              <StudentAcademicTab classLabel={classLabel} slots={slots} />
            )}
            {activeTab === 'homework' && <StudentHomeworkTab />}
            {activeTab === 'student-documents' && (
              <StudentDocumentsTab
                studentId={studentId}
                docs={docs}
                onChanged={reloadDocs}
                student={student}
              />
            )}
            {activeTab === 'exams' && (
              <StudentExamsTab schedules={schedules} ticket={ticket} reportCards={reportCards} />
            )}
            {activeTab === 'communication' && (
              <StudentCommsTab notifs={notifs} onNavigateTab={handleTabChange} />
            )}
            {activeTab === 'fees' && (
              <StudentFeesTab feeSummary={feeSummary} student={student} />
            )}
            {activeTab === 'community-events' && (
              <StudentEventsTab
                events={events}
                onChanged={setEvents}
                studentName={student?.name || currentUser.name || 'ganesh'}
              />
            )}
            {activeTab === 'transport' && <StudentTransportTab />}
          </>
        )}
      </ScrollView>
    </PortalShell>
  );
}

const styles = StyleSheet.create({
  scrollArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 100 },
});
