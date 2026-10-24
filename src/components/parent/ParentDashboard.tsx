import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  Grid, GraduationCap, BookOpen, CheckSquare, Bell, CreditCard, FileText, MessageSquare, Globe2, Truck,
} from 'lucide-react-native';
import type { User } from '../../types/auth';
import type { Student } from '../../types/student';
import { PortalShell, PortalNavItem, LoadingView } from '../common';
import { useParentPortalData } from './hooks/useParentPortalData';
import { CYCLE_LABEL, resolveActiveWard } from '../../utils';
import { apiGetEvents, apiGetConversations } from '../../services/schoolApi';
import { chatSocket } from '../../services/chatSocket';
import { useNotificationReadStore, formatBadgeCount } from '../../services/notificationStore';
import { ParentHomeTab } from './tabs/ParentHomeTab';
import { ParentAcademicTab } from './tabs/ParentAcademicTab';
import { ParentHomeworkTab } from './tabs/ParentHomeworkTab';
import { ParentAttendanceTab } from './tabs/ParentAttendanceTab';
import { ParentNoticesTab } from './tabs/ParentNoticesTab';
import { ParentFeesTab } from './tabs/ParentFeesTab';
import { ParentExamsTab } from './tabs/ParentExamsTab';
import { ParentChatTab } from './tabs/ParentChatTab';
import { ParentEventsTab } from './tabs/ParentEventsTab';
import { ParentTransportTab } from './tabs/ParentTransportTab';

export type ParentNavTab =
  | 'dashboard' | 'academic' | 'homework' | 'attendance' | 'notifications' | 'fees'
  | 'exams' | 'communication' | 'community-events' | 'transport';

const PARENT_NAV_ITEMS: PortalNavItem<ParentNavTab>[] = [
  { id: 'dashboard', label: 'Parent Portal', icon: Grid },
  { id: 'academic', label: "Child's Timetable", icon: GraduationCap },
  { id: 'homework', label: 'Class Homework', icon: BookOpen },
  { id: 'attendance', label: 'Ward Attendance', icon: CheckSquare },
  { id: 'notifications', label: 'School Notices', icon: Bell },
  { id: 'fees', label: 'School Fee Desk', icon: CreditCard },
  { id: 'exams', label: 'Exam Reports', icon: FileText },
  { id: 'communication', label: 'Teacher Chat', icon: MessageSquare },
  { id: 'community-events', label: 'Community & Events', icon: Globe2 },
  { id: 'transport', label: 'Transport Tracker', icon: Truck },
];

const BREADCRUMB_MAP: Record<ParentNavTab, string> = {
  dashboard: 'Dashboard',
  academic: 'Timetable',
  homework: 'Class Homework',
  attendance: 'Attendance',
  notifications: 'Notifications',
  fees: 'Fees',
  exams: 'Exams',
  communication: 'Communication',
  'community-events': 'Events',
  transport: 'Transport',
};

interface ParentDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
}

export function ParentDashboard({
  currentUser,
  onLogout,
  onOpenChat,
  onOpenNotifications,
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<ParentNavTab>('dashboard');
  const [selectedWardId, setSelectedWardId] = useState<number | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { loading, wards, slots, notifications, events, setEvents, refetch } = useParentPortalData(currentUser);
  const activeWard: Student | undefined = resolveActiveWard(wards, selectedWardId);

  const reloadEvents = async () => {
    try { setEvents(await apiGetEvents()); } catch {}
  };

  const handleTabChange = (tab: ParentNavTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        reloadEvents(),
      ]);
    } catch (e) {
      console.warn('Failed to refresh data', e);
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

  // Sync active ward when wards load
  useEffect(() => {
    if (!wards.length) return;
    if (selectedWardId === 'all' && currentUser.parentStudentIds?.length) {
      setSelectedWardId(wards[0].id);
    } else if (selectedWardId !== 'all' && !wards.some((w) => w.id === selectedWardId)) {
      setSelectedWardId(wards[0].id);
    }
  }, [wards, currentUser.parentStudentIds]);

  // When parent opens the communication tab, clear unread count
  useEffect(() => {
    if (activeTab === 'communication') {
      setUnreadPeopleCount(0);
    }
  }, [activeTab]);

  const { isRead, readVersion } = useNotificationReadStore();

  const unreadNotifsCount = React.useMemo(() => {
    return (notifications || []).filter((n) => !isRead(n)).length;
  }, [notifications, isRead, readVersion]);

  const navItems = React.useMemo(() => {
    const commBadge = formatBadgeCount(unreadPeopleCount);
    const notifsBadge = formatBadgeCount(unreadNotifsCount);

    return PARENT_NAV_ITEMS.map((item) => {
      if (item.id === 'communication') {
        return {
          ...item,
          badge: commBadge,
        };
      }
      if (item.id === 'notifications') {
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
  }, [unreadPeopleCount, unreadNotifsCount]);

  return (
    <PortalShell
      items={navItems}
      activeTab={activeTab}
      onSelectTab={handleTabChange}
      userRole="PARENT"
      breadcrumbLabel={BREADCRUMB_MAP[activeTab] || 'Dashboard'}
      userName={currentUser.name || 'ullasam'}
      onLogout={onLogout}
      showSchoolArt={true}
      cycleText={CYCLE_LABEL}
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
            title="Reloading portal data..."
            titleColor="#64748B"
          />
        }
      >
        {loading ? (
          <LoadingView message="Loading Parent and Family Portal..." color="#4F46E5" />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <ParentHomeTab
                currentUser={currentUser}
                wards={wards}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
                slots={slots}
                onNavigate={(t) => handleTabChange(t)}
              />
            )}
            {activeTab === 'academic' && (
              <ParentAcademicTab wards={wards} selectedWardId={selectedWardId} onSelectWard={setSelectedWardId} slots={slots} />
            )}
            {activeTab === 'homework' && (
              <ParentHomeworkTab
                wards={wards}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
                onNavigate={(t) => handleTabChange(t)}
              />
            )}
            {activeTab === 'attendance' && (
              <ParentAttendanceTab wards={wards} selectedWardId={selectedWardId} onSelectWard={setSelectedWardId} />
            )}
            {activeTab === 'notifications' && (
              <ParentNoticesTab
                wards={wards}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
              />
            )}
            {activeTab === 'fees' && (
              <ParentFeesTab
                wards={wards}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
              />
            )}
            {activeTab === 'exams' && (
              <ParentExamsTab
                wards={wards}
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
              />
            )}
            {activeTab === 'communication' && (
              <ParentChatTab
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                wards={wards}
                selectedWardId={selectedWardId}
                onNavigateHomework={() => handleTabChange('homework')}
              />
            )}
            {activeTab === 'community-events' && <ParentEventsTab events={events} onChanged={reloadEvents} />}
            {activeTab === 'transport' && <ParentTransportTab />}
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

