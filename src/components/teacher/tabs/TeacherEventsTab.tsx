import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Search,
  Plus,
  Edit3,
  Ticket,
  X,
  Sparkles,
  Bell,
  Megaphone,
  Send,
  Layers,
  Globe2,
  RefreshCw,
  Check,
  CheckCheck,
  MessageSquare,
} from 'lucide-react-native';
import type { SchoolEvent } from '../../../types/communication';
import {
  apiCreateEvent,
  apiDeleteEvent,
  apiSendNotification,
  apiSubmitTeacherLeaveRequest,
} from '../../../services/schoolApi';
import { useNotificationReadStore, DEFAULT_NOTIFICATIONS } from '../../../services/notificationStore';
import { pushNotificationService } from '../../../services/pushNotificationService';

interface TeacherEventsTabProps {
  events: SchoolEvent[];
  onChanged: (e: SchoolEvent[]) => void;
  userName: string;
  leaveRequests?: any[];
  onLeaveAdded?: (r: any) => void;
  notifs?: any[];
  onNotifAdded?: () => void;
  students?: any[];
}

export type CommunitySubTab = 'events' | 'requests' | 'broadcast';
export type EventFilterType = 'all' | 'active' | 'inactive';
const EVENT_CATEGORIES = ['All Categories', 'School Event', 'Academic', 'Sports', 'Cultural', 'Workshop'] as const;
type AudienceType = 'Assigned Students' | 'Assigned Parents' | 'Notify Admin / Office';

export function TeacherEventsTab({
  events,
  onChanged,
  userName,
  leaveRequests = [],
  onLeaveAdded = () => {},
  notifs = [],
  onNotifAdded = () => {},
  students = [],
}: TeacherEventsTabProps) {
  // Top community sub-navigation
  const [subTab, setSubTab] = useState<CommunitySubTab>('events');

  // ==========================================
  // TAB 1: CAMPUS EVENTS STATE
  // ==========================================
  const [activeFilter, setActiveFilter] = useState<EventFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof EVENT_CATEGORIES[number]>('All Categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Modal states for Post & Edit Event
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Event Form states
  const [formTitle, setFormTitle] = useState('');
  const [formVenue, setFormVenue] = useState('Bangalore');
  const [formDateTime, setFormDateTime] = useState('22 Oct 2026, 10:21');
  const [formKind, setFormKind] = useState<SchoolEvent['kind']>('School event');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [eventBusy, setEventBusy] = useState(false);

  const sourceEvents = (events || []) as (SchoolEvent & { dateTimeFormatted?: string; hasPass?: boolean })[];
  const allEventsCount = sourceEvents.length;
  const activeEventsCount = sourceEvents.filter((e) => (e.activityStatus || 'active') === 'active').length;
  const inactiveEventsCount = sourceEvents.filter((e) => e.activityStatus === 'completed' || e.activityStatus === 'cancelled' || (e as any).activityStatus === 'inactive').length;

  const filteredEvents = sourceEvents.filter((e) => {
    const isEventActive = (e.activityStatus || 'active') === 'active';
    if (activeFilter === 'active' && !isEventActive) return false;
    if (activeFilter === 'inactive' && isEventActive) return false;

    if (selectedCategory !== 'All Categories') {
      const matchKind =
        selectedCategory.toLowerCase() === 'school event'
          ? (e.kind || '').toLowerCase().includes('school')
          : (e.kind || '').toLowerCase() === selectedCategory.toLowerCase();
      if (!matchKind) return false;
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const matchQuery =
        (e.title || '').toLowerCase().includes(query) ||
        (e.venue || '').toLowerCase().includes(query) ||
        (e.description || '').toLowerCase().includes(query);
      if (!matchQuery) return false;
    }

    return true;
  });

  const formatNow = () => {
    const d = new Date();
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormVenue('');
    setFormDateTime(formatNow());
    setFormKind('School event');
    setFormDescription('');
    setFormStatus('active');
    setPostModalVisible(true);
  };

  const handleOpenEditModal = (event: SchoolEvent & { dateTimeFormatted?: string }) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormVenue(event.venue || '');
    setFormDateTime(event.dateTimeFormatted || formatNow());
    setFormKind(event.kind);
    setFormDescription(event.description || '');
    setFormStatus((event.activityStatus || 'active') === 'active' ? 'active' : 'inactive');
    setPostModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required Field', 'Please enter an event title.');
      return;
    }
    setEventBusy(true);
    try {
      if (editingEventId !== null) {
        const updated = sourceEvents.map((e) =>
          e.id === editingEventId
            ? {
                ...e,
                title: formTitle.trim(),
                venue: formVenue.trim() || 'Auditorium',
                dateTimeFormatted: formDateTime.trim() || formatNow(),
                kind: formKind,
                description: formDescription.trim(),
                activityStatus: (formStatus === 'active' ? 'active' : 'completed') as SchoolEvent['activityStatus'],
              }
            : e
        );
        onChanged(updated);
        Alert.alert('Updated', 'Event details updated successfully.');
      } else {
        const todayDate = new Date().toISOString().split('T')[0];
        let backendCreated: any = null;
        try {
          backendCreated = await apiCreateEvent({
            title: formTitle.trim(),
            kind: formKind,
            venue: formVenue.trim() || 'Auditorium',
            date: todayDate,
            startTime: '10:00 AM',
            endTime: '01:00 PM',
            description: formDescription.trim(),
            capacity: 100,
          });
        } catch {}

        const newEv: SchoolEvent & { dateTimeFormatted?: string; hasPass?: boolean } = {
          id: backendCreated?.id || Date.now(),
          schoolId: backendCreated?.schoolId || 'SCH-01',
          title: formTitle.trim(),
          kind: formKind,
          status: 'Published',
          activityStatus: (formStatus === 'active' ? 'active' : 'completed') as SchoolEvent['activityStatus'],
          venue: formVenue.trim() || 'Auditorium',
          dateTimeFormatted: formDateTime.trim() || formatNow(),
          eventDate: todayDate,
          date: todayDate,
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          description: formDescription.trim() || 'Campus event',
          capacity: 100,
          registeredCount: 0,
          organizer: userName || 'Teacher',
          hasPass: true,
          ticketCode: `PASS-${Date.now().toString().slice(-4)}`,
        };
        onChanged([newEv, ...sourceEvents]);
        pushNotificationService.triggerLocalPushNotification({
          title: `New Campus Event: ${formTitle.trim()}`,
          body: `${formTitle.trim()} is scheduled for ${formDateTime.trim() || 'upcoming date'} at ${formVenue.trim() || 'Campus'}.`,
          data: {
            type: 'event',
            eventId: newEv.id,
            title: newEv.title,
            venue: newEv.venue,
            date: newEv.eventDate,
          },
        });
        Alert.alert('Published', 'New campus event published successfully.');
      }
      setPostModalVisible(false);
    } catch (e: any) {
      Alert.alert('Action Failed', e?.message || 'Could not save event.');
    } finally {
      setEventBusy(false);
    }
  };

  const handleDeleteEvent = (id: number, titleToDelete: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${titleToDelete}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteEvent(id).catch(() => {});
              onChanged(sourceEvents.filter((e) => e.id !== id));
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete event.');
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // TAB 2: REQUESTS & LEAVE STATE
  // ==========================================
  const todayStr = new Date().toISOString().split('T')[0];
  const { markRead, markUnread, markAllRead, isRead, formatBadge } = useNotificationReadStore();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Duty Leave'>('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(todayStr);
  const [leaveEndDate, setLeaveEndDate] = useState(todayStr);
  const [leaveReason, setLeaveReason] = useState('');
  const [substituteTeacher, setSubstituteTeacher] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'All' | 'Unread' | 'Leave Requests' | 'Urgent' | 'Notices'>('All');
  const [refreshingRequests, setRefreshingRequests] = useState(false);

  const effectiveNotifs = notifs && notifs.length > 0 ? notifs : DEFAULT_NOTIFICATIONS;

  const allStaffRequests = [
    ...(leaveRequests || []).map((r: any) => ({
      id: `leave-${r.id}`,
      rawId: r.id,
      type: 'leave' as const,
      title: `${r.leaveType || 'Leave Request'} (${r.startDate} to ${r.endDate})`,
      body: r.reason || 'Personal obligation',
      status: r.status || 'Pending',
      date: r.appliedAt || 'Today',
      time: '',
      remarks: r.adminRemarks,
      sender: 'Teacher Self-Desk',
      isRead: true, // Teacher's own submitted leaves
    })),
    ...effectiveNotifs.map((n: any) => ({
      id: `notif-${n.id}`,
      rawId: n.id,
      type: 'notice' as const,
      title: n.title,
      body: n.body,
      status: n.category || 'Notice',
      date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent',
      time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      remarks: null,
      sender: n.sender?.name || (n.title.startsWith('New Message from ') ? n.title.replace('New Message from ', '') : 'School Administration'),
      isRead: isRead(n),
    })),
  ];

  const unreadStaffRequestsCount = allStaffRequests.filter((item) => !item.isRead).length;

  const handleMarkAllRead = async () => {
    if (unreadStaffRequestsCount === 0) return;
    try {
      await markAllRead(allStaffRequests);
      onNotifAdded();
      Alert.alert('Marked as Read', 'All messages and requests have been marked as read.');
    } catch {
      Alert.alert('Notice', 'Messages marked as read.');
    }
  };

  const handleOpenMessage = (item: any) => {
    setSelectedMessage(item);
    if (!item.isRead) {
      markRead(item.rawId || item.id);
      onNotifAdded();
    }
  };

  const filteredStaffRequests = allStaffRequests.filter((item) => {
    if (notifFilter === 'All') return true;
    if (notifFilter === 'Unread') return !item.isRead;
    if (notifFilter === 'Leave Requests') return item.type === 'leave';
    if (notifFilter === 'Notices') return item.type === 'notice';
    if (notifFilter === 'Urgent') return (item.status || '').toLowerCase() === 'urgent';
    return true;
  });

  const handleSubmitLeave = async () => {
    if (!leaveReason.trim()) {
      Alert.alert('Missing Reason', 'Please provide a reason for the leave application.');
      return;
    }
    setSubmittingLeave(true);
    try {
      const req = await apiSubmitTeacherLeaveRequest({
        leaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        daysCount: 2,
        reason: `${leaveReason.trim()} (Handover: ${substituteTeacher})`,
      });
      onLeaveAdded(req);
      pushNotificationService.triggerLocalPushNotification({
        title: 'Leave Application Submitted',
        body: `${leaveType} application submitted to administrator desk for review.`,
        data: {
          type: 'notice',
          category: 'Leave Request',
        },
      });
      setLeaveReason('');
      setLeaveModalVisible(false);
      Alert.alert('Leave Submitted', 'Your leave request has been submitted to the office desk.');
    } catch (e: any) {
      Alert.alert('Submission Error', e?.message || 'Could not submit leave.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleRefreshRequests = async () => {
    setRefreshingRequests(true);
    try {
      await onNotifAdded();
    } catch {}
    setTimeout(() => setRefreshingRequests(false), 500);
  };

  // ==========================================
  // TAB 3: BROADCAST DESK STATE
  // ==========================================
  const [sendToAudience, setSendToAudience] = useState<AudienceType>('Assigned Students');
  const [broadcastCategory, setBroadcastCategory] = useState('Assignment posted');
  const [broadcastCategoryOpen, setBroadcastCategoryOpen] = useState(false);
  const [assignedClassSection, setAssignedClassSection] = useState('All My Assigned Classes & Sections');
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [publishingBroadcast, setPublishingBroadcast] = useState(false);

  const assignedClassOptions = React.useMemo(() => {
    const set = new Set<string>();
    (students || []).forEach((s: any) => {
      if (s.className) {
        set.add(`${s.className}${s.sectionName ? ' - Sec ' + s.sectionName : ''}`);
      }
    });
    const arr = Array.from(set);
    return ['All My Assigned Classes & Sections', ...(arr.length > 0 ? arr : ['Class 1 - Sec A'])];
  }, [students]);

  const handlePublishBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      Alert.alert('Required Fields', 'Both announcement title and body content are required.');
      return;
    }
    const currentTitle = broadcastTitle.trim();
    const currentBody = broadcastBody.trim();
    const currentCategory = broadcastCategory;
    setPublishingBroadcast(true);
    try {
      await apiSendNotification({
        title: currentTitle,
        body: currentBody,
        category: currentCategory,
        target: sendToAudience,
      });
      setBroadcastTitle('');
      setBroadcastBody('');
      onNotifAdded();
      pushNotificationService.triggerLocalPushNotification({
        title: `Broadcast: ${currentTitle}`,
        body: currentBody,
        data: {
          type: 'notice',
          category: currentCategory,
          broadcast: true,
          target: sendToAudience,
        },
      });
      Alert.alert('Broadcast Published', `Official announcement broadcasted to ${sendToAudience}.`);
    } catch (e: any) {
      Alert.alert('Publish Error', e?.message || 'Failed to send broadcast.');
    } finally {
      setPublishingBroadcast(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 0. COMMUNITY SEGMENT SWITCHER TABS                       */}
      {/* ======================================================== */}
      <View style={styles.segmentSwitcherCard}>
        <Pressable
          style={[styles.segmentTab, subTab === 'events' && styles.segmentTabActive]}
          onPress={() => setSubTab('events')}
        >
          <Globe2 size={14} color={subTab === 'events' ? '#2563EB' : '#64748B'} />
          <Text style={[styles.segmentTabText, subTab === 'events' && styles.segmentTabTextActive]}>
            Events
          </Text>
          <View style={[styles.badgeCount, subTab === 'events' && styles.badgeCountActive]}>
            <Text style={[styles.badgeCountText, subTab === 'events' && styles.badgeCountTextActive]}>
              {allEventsCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.segmentTab, subTab === 'requests' && styles.segmentTabActive]}
          onPress={() => setSubTab('requests')}
        >
          <Bell size={14} color={subTab === 'requests' ? '#2563EB' : '#64748B'} />
          <Text style={[styles.segmentTabText, subTab === 'requests' && styles.segmentTabTextActive]}>
            Requests
          </Text>
          {unreadStaffRequestsCount > 0 && (
            <View style={[styles.badgeCount, subTab === 'requests' && styles.badgeCountActive]}>
              <Text style={[styles.badgeCountText, subTab === 'requests' && styles.badgeCountTextActive]}>
                {unreadStaffRequestsCount > 10 ? '10+' : unreadStaffRequestsCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.segmentTab, subTab === 'broadcast' && styles.segmentTabActive]}
          onPress={() => setSubTab('broadcast')}
        >
          <Megaphone size={14} color={subTab === 'broadcast' ? '#2563EB' : '#64748B'} />
          <Text style={[styles.segmentTabText, subTab === 'broadcast' && styles.segmentTabTextActive]}>
            Broadcast
          </Text>
        </Pressable>
      </View>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: CAMPUS EVENTS                                */}
      {/* ======================================================== */}
      {subTab === 'events' && (
        <>
          <View style={styles.topBannerCard}>
            <View style={styles.watermarkCircle1} />
            <View style={styles.watermarkCircle2} />

            <View style={styles.bannerContentRow}>
              <View style={styles.bannerLeftCol}>
                <View style={styles.bannerBadgesRow}>
                  <View style={styles.publishedEventsPill}>
                    <Text style={styles.publishedEventsPillText}>PUBLISHED EVENTS</Text>
                  </View>
                  <View style={styles.teacherViewPill}>
                    <Text style={styles.teacherViewPillText}>Teacher View</Text>
                  </View>
                </View>

                <Text style={styles.bannerTitle}>School Events & Programs</Text>
                <Text style={styles.bannerSubtitle}>
                  Browse published workshops, competitions, and seminars. Active events accept online registrations until their deadline.
                </Text>
              </View>

              <Pressable style={styles.postEventBtn} onPress={handleOpenCreateModal}>
                <Plus size={16} color="#2563EB" strokeWidth={2.6} />
                <Text style={styles.postEventBtnText}>Post an Event</Text>
              </Pressable>
            </View>
          </View>

          {/* 3 Metrics */}
          <View style={styles.metricsRow}>
            <Pressable
              style={[styles.metricCard, activeFilter === 'all' && styles.metricCardActiveAll]}
              onPress={() => setActiveFilter('all')}
            >
              <View style={styles.metricCardTop}>
                <View style={styles.purpleIconBox}>
                  <Calendar size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.metricNumber}>{allEventsCount}</Text>
              </View>
              <Text style={styles.metricTitle}>All Published Events</Text>
              <Text style={styles.metricSubGray}>Total scheduled programs</Text>
            </Pressable>

            <Pressable
              style={[styles.metricCard, activeFilter === 'active' && styles.metricCardActiveGreen]}
              onPress={() => setActiveFilter('active')}
            >
              <View style={styles.metricCardTop}>
                <View style={styles.greenIconBox}>
                  <CheckCircle2 size={18} color="#10B981" />
                </View>
                <Text style={[styles.metricNumber, { color: '#059669' }]}>{activeEventsCount}</Text>
              </View>
              <Text style={styles.metricTitle}>Active Events</Text>
              <Text style={styles.metricSubGreen}>Registration is currently open</Text>
            </Pressable>

            <Pressable
              style={[styles.metricCard, activeFilter === 'inactive' && styles.metricCardActiveRed]}
              onPress={() => setActiveFilter('inactive')}
            >
              <View style={styles.metricCardTop}>
                <View style={styles.pinkIconBox}>
                  <Clock size={18} color="#F43F5E" />
                </View>
                <Text style={[styles.metricNumber, { color: '#E11D48' }]}>{inactiveEventsCount}</Text>
              </View>
              <Text style={styles.metricTitle}>In-active Events</Text>
              <Text style={styles.metricSubRed}>Deadline passed / closed</Text>
            </Pressable>
          </View>

          {/* Filters & Search */}
          <View style={styles.filterAndSearchRow}>
            <View style={styles.filterPillsRow}>
              <Pressable
                style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActiveAll]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActiveAll]}>
                  All ({allEventsCount})
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, activeFilter === 'active' ? styles.filterPillActiveGreen : styles.filterPillInactiveGreen]}
                onPress={() => setActiveFilter('active')}
              >
                <View style={[styles.filterDot, { backgroundColor: activeFilter === 'active' ? '#FFFFFF' : '#10B981' }]} />
                <Text style={[styles.filterPillText, activeFilter === 'active' && styles.filterPillTextWhite, activeFilter !== 'active' && { color: '#059669' }]}>
                  Active ({activeEventsCount})
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, activeFilter === 'inactive' ? styles.filterPillActiveRed : styles.filterPillInactiveRed]}
                onPress={() => setActiveFilter('inactive')}
              >
                <View style={[styles.filterDot, { backgroundColor: activeFilter === 'inactive' ? '#FFFFFF' : '#E11D48' }]} />
                <Text style={[styles.filterPillText, activeFilter === 'inactive' && styles.filterPillTextWhite, activeFilter !== 'inactive' && { color: '#DC2626' }]}>
                  In-active ({inactiveEventsCount})
                </Text>
              </Pressable>
            </View>

            <View style={styles.searchAndCategoryRow}>
              <View style={styles.searchBox}>
                <Search size={14} color="#94A3B8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search events..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                />
              </View>

              <Pressable
                style={styles.categoryDropdownTrigger}
                onPress={() => setCategoryDropdownOpen((v) => !v)}
              >
                <Text style={styles.categoryDropdownTriggerText}>{selectedCategory}</Text>
                <ChevronDown size={14} color="#64748B" />
              </Pressable>
            </View>
          </View>

          {categoryDropdownOpen && (
            <View style={styles.categoryDropdownMenu}>
              {EVENT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryDropdownItem, selectedCategory === cat && styles.categoryDropdownItemActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.categoryDropdownItemText, selectedCategory === cat && styles.categoryDropdownItemTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Events List */}
          <View style={styles.eventsListContainer}>
            {filteredEvents.map((e) => {
              const isActive = (e.activityStatus || 'active') === 'active';
              return (
                <View key={e.id} style={styles.eventCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardBadgesGroup}>
                      <View style={styles.schoolEventBadge}>
                        <Text style={styles.schoolEventBadgeText}>
                          {(e.kind || 'SCHOOL EVENT').toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#059669' : '#DC2626' }]} />
                        <Text style={[styles.statusPillText, { color: isActive ? '#059669' : '#DC2626' }]}>
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                      </View>
                      <View style={styles.passBadge}>
                        <Ticket size={12} color="#B45309" />
                        <Text style={styles.passBadgeText}>Pass</Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsGroup}>
                      <Pressable style={styles.actionIconBtn} onPress={() => handleOpenEditModal(e)}>
                        <Edit3 size={15} color="#64748B" />
                      </Pressable>
                      <Pressable style={styles.actionIconBtn} onPress={() => handleDeleteEvent(e.id, e.title)}>
                        <Trash2 size={15} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventDescription}>{e.description || 'Institutional program'}</Text>

                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color="#3B82F6" />
                      <Text style={styles.detailText}>
                        {e.dateTimeFormatted ||
                          `${new Date(e.eventDate || e.date || '2026-10-22').toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}, ${e.startTime || '10:00 AM'}`}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={14} color="#059669" />
                      <Text style={styles.detailText}>{e.venue || 'Campus Auditorium'}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredEvents.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconContainer}>
                  <Calendar size={36} color="#818CF8" />
                </View>
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'inactive'
                    ? 'No in-active or past events found.'
                    : activeFilter === 'active'
                    ? 'No active events currently scheduled.'
                    : 'No campus events found.'}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: REQUESTS & LEAVE                             */}
      {/* ======================================================== */}
      {subTab === 'requests' && (
        <View style={styles.tabContentCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.headerIconBoxPurple}>
                <Bell size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Notifications & Staff Requests</Text>
                <Text style={styles.sectionSubtitle}>
                  Submit leave applications, view approvals, and official announcements
                </Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <Pressable
                style={styles.orangeSubmitBtn}
                onPress={() => setLeaveModalVisible(true)}
              >
                <Calendar size={13} color="#FFFFFF" />
                <Text style={styles.orangeSubmitBtnText}>+ New Leave Request</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.markAllReadBtn,
                  unreadStaffRequestsCount === 0 && styles.markAllReadBtnDisabled,
                ]}
                onPress={handleMarkAllRead}
                disabled={unreadStaffRequestsCount === 0}
              >
                <CheckCheck
                  size={13}
                  color={unreadStaffRequestsCount === 0 ? '#94A3B8' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.markAllReadBtnText,
                    unreadStaffRequestsCount === 0 && styles.markAllReadBtnTextDisabled,
                  ]}
                >
                  Mark all read
                </Text>
              </Pressable>

              <Pressable style={styles.refreshPillBtn} onPress={handleRefreshRequests}>
                <RefreshCw size={13} color="#475569" style={refreshingRequests ? { transform: [{ rotate: '180deg' }] } : {}} />
                <Text style={styles.refreshPillBtnText}>Refresh</Text>
              </Pressable>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRowRequests}>
            <Text style={styles.filterLeadText}>FILTER:</Text>
            {(['All', 'Unread', 'Leave Requests', 'Urgent', 'Notices'] as const).map((f) => (
              <Pressable
                key={f}
                style={[styles.filterCapsule, notifFilter === f && styles.filterCapsuleActive]}
                onPress={() => setNotifFilter(f)}
              >
                <Text style={[styles.filterCapsuleText, notifFilter === f && styles.filterCapsuleTextActive]}>
                  {f}{f === 'Unread' && unreadStaffRequestsCount > 0 ? ` (${unreadStaffRequestsCount})` : ''}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Requests List */}
          {filteredStaffRequests.length === 0 ? (
            <View style={styles.dashedEmptyBox}>
              <View style={styles.emptyBellIconWrap}>
                <Bell size={36} color="#CBD5E1" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No notices or requests in this view</Text>
              <Text style={styles.emptySubtitle}>
                Submitted leave requests and incoming official notices will appear here automatically.
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {filteredStaffRequests.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.requestItemCard,
                    !item.isRead && styles.requestItemCardUnread,
                  ]}
                >
                  <Pressable
                    onPress={() => handleOpenMessage(item)}
                    style={{ width: '100%', gap: 6 }}
                  >
                    <View style={styles.requestItemHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.requestTitleText, !item.isRead && styles.requestTitleTextUnread]}>
                            {item.title}
                          </Text>
                          {!item.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.requestDateText}>
                          {item.date} {item.time ? `• ${item.time}` : ''}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {!item.isRead ? (
                          <View style={styles.unreadTag}>
                            <Text style={styles.unreadTagText}>UNREAD</Text>
                          </View>
                        ) : (
                          <View style={styles.readTag}>
                            <Check size={10} color="#10B981" />
                            <Text style={styles.readTagText}>READ</Text>
                          </View>
                        )}
                        <View style={[styles.statusBadge, item.status === 'Approved' ? styles.statusBadgeApproved : styles.statusBadgePending]}>
                          <Text style={[styles.statusBadgeText, item.status === 'Approved' ? styles.statusBadgeTextApproved : styles.statusBadgeTextPending]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.requestBodyText} numberOfLines={3}>
                      {item.body}
                    </Text>
                    {item.remarks && (
                      <View style={styles.adminRemarksBox}>
                        <Text style={styles.adminRemarksLabel}>OFFICIAL REMARKS:</Text>
                        <Text style={styles.adminRemarksContent}>{item.remarks}</Text>
                      </View>
                    )}
                  </Pressable>

                  {/* Card bottom actions row */}
                  <View style={styles.cardActionRow}>
                    <Pressable
                      hitSlop={6}
                      onPress={() => handleOpenMessage(item)}
                    >
                      <Text style={styles.tapToReadHint}>Tap card to read full message</Text>
                    </Pressable>
                    {!item.isRead ? (
                      <Pressable
                        style={styles.quickMarkReadBtn}
                        hitSlop={6}
                        onPress={() => {
                          markRead(item.rawId || item.id);
                          onNotifAdded();
                        }}
                      >
                        <CheckCheck size={12} color="#2563EB" />
                        <Text style={styles.quickMarkReadBtnText}>Mark read</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.quickMarkUnreadBtn}
                        hitSlop={6}
                        onPress={() => {
                          markUnread(item.rawId || item.id);
                          onNotifAdded();
                        }}
                      >
                        <Text style={styles.quickMarkUnreadBtnText}>Mark unread</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: BROADCAST DESK                              */}
      {/* ======================================================== */}
      {subTab === 'broadcast' && (
        <View style={styles.tabContentCard}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.headerIconBoxPurple}>
              <Megaphone size={20} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Broadcast Announcement Desk</Text>
              <Text style={styles.sectionSubtitle}>
                Send official announcements to your assigned class students and their parents
              </Text>
            </View>
          </View>

          <View style={styles.broadcastFormContainer}>
            {/* SEND TO Row */}
            <View style={styles.sendToRow}>
              <Text style={styles.formRowLabel}>SEND TO:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sendToButtonsScroll}
              >
                {(['Assigned Students', 'Assigned Parents', 'Notify Admin / Office'] as const).map((aud) => (
                  <Pressable
                    key={aud}
                    style={[styles.audiencePill, sendToAudience === aud && styles.audiencePillActive]}
                    onPress={() => setSendToAudience(aud)}
                  >
                    <Text style={[styles.audiencePillText, sendToAudience === aud && styles.audiencePillTextActive]}>
                      {aud}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Category Dropdown */}
            <View style={styles.categoryDropdownContainer}>
              <Text style={styles.categoryDropdownLabel}>CATEGORY:</Text>
              <Pressable
                style={styles.categorySelectorBox}
                onPress={() => setBroadcastCategoryOpen((v) => !v)}
              >
                <Text style={styles.categorySelectorText}>{broadcastCategory}</Text>
                <ChevronDown size={14} color="#64748B" />
              </Pressable>
            </View>

            {broadcastCategoryOpen && (
              <View style={styles.dropdownMenuFloating}>
                {['Assignment posted', 'General', 'Exam Notice', 'Holiday Alert', 'Urgent Alert'].map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.dropdownMenuItem, broadcastCategory === c && styles.dropdownMenuItemActive]}
                    onPress={() => {
                      setBroadcastCategory(c);
                      setBroadcastCategoryOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownMenuItemText, broadcastCategory === c && styles.dropdownMenuItemTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Assigned Class Banner */}
            <View style={styles.amberClassBannerCard}>
              <View style={styles.amberBannerHeader}>
                <Layers size={16} color="#D97706" />
                <Text style={styles.amberBannerTitle}>SELECT YOUR ASSIGNED CLASS & SECTION</Text>
              </View>

              <Pressable
                style={styles.classSelectorBox}
                onPress={() => setClassDropdownOpen((v) => !v)}
              >
                <Text style={styles.classSelectorText}>{assignedClassSection}</Text>
                <ChevronDown size={16} color="#64748B" />
              </Pressable>

              {classDropdownOpen && (
                <View style={styles.classDropdownMenu}>
                  {assignedClassOptions.map((cls) => (
                    <Pressable
                      key={cls}
                      style={[styles.classDropdownItem, assignedClassSection === cls && styles.classDropdownItemActive]}
                      onPress={() => {
                        setAssignedClassSection(cls);
                        setClassDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.classDropdownItemText, assignedClassSection === cls && styles.classDropdownItemTextActive]}>
                        {cls}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.amberBannerSubtext}>
                Announcements are broadcast strictly to students & parents within your selected scope.
              </Text>
            </View>

            {/* Title Input */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputFieldLabel}>ANNOUNCEMENT TITLE</Text>
              <TextInput
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
                placeholder="e.g. Mathematics Test Postponed / Science Project Submission..."
                placeholderTextColor="#94A3B8"
                style={styles.broadcastTextInput}
              />
            </View>

            {/* Body Textarea */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputFieldLabel}>MESSAGE CONTENT</Text>
              <TextInput
                value={broadcastBody}
                onChangeText={setBroadcastBody}
                placeholder="Write full announcement details..."
                placeholderTextColor="#94A3B8"
                style={[styles.broadcastTextInput, styles.broadcastTextArea]}
                multiline
                numberOfLines={6}
              />
            </View>

            {/* Bottom Right Publish Button */}
            <View style={styles.publishBtnContainer}>
              <Pressable
                style={[styles.publishBroadcastBtn, publishingBroadcast && { opacity: 0.7 }]}
                onPress={handlePublishBroadcast}
                disabled={publishingBroadcast}
              >
                {publishingBroadcast ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Send size={16} color="#FFFFFF" />
                    <Text style={styles.publishBroadcastBtnText}>Publish Broadcast</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. POST / EDIT EVENT MODAL                               */}
      {/* ======================================================== */}
      <Modal
        visible={postModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIconBox}>
                  <Sparkles size={18} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingEventId !== null ? 'Edit Event Details' : 'Post / Schedule Event'}
                  </Text>
                  <Text style={styles.modalSubtitle}>Institutional events & campus activity programs</Text>
                </View>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={() => setPostModalVisible(false)}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EVENT TITLE:</Text>
                <TextInput
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="e.g. Science Exhibition / Annual Sports Day"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CATEGORY / KIND:</Text>
                <View style={styles.formCategoryPills}>
                  {(['School event', 'Academic', 'Sports', 'Cultural', 'Workshop'] as const).map((kind) => (
                    <Pressable
                      key={kind}
                      style={[styles.formCategoryPill, formKind === kind && styles.formCategoryPillActive]}
                      onPress={() => setFormKind(kind)}
                    >
                      <Text style={[styles.formCategoryPillText, formKind === kind && styles.formCategoryPillTextActive]}>
                        {kind}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DATE & TIME:</Text>
                <TextInput
                  value={formDateTime}
                  onChangeText={setFormDateTime}
                  placeholder="22 Oct 2026, 10:21"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>LOCATION / VENUE:</Text>
                <TextInput
                  value={formVenue}
                  onChangeText={setFormVenue}
                  placeholder="e.g. Auditorium / Main Playground"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DESCRIPTION / INSTRUCTIONS:</Text>
                <TextInput
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Event instructions, dress code, registration details..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.formInput, styles.formTextArea]}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>REGISTRATION STATUS:</Text>
                <View style={styles.statusToggleRow}>
                  <Pressable
                    style={[styles.statusToggleBtn, formStatus === 'active' && styles.statusToggleBtnActiveGreen]}
                    onPress={() => setFormStatus('active')}
                  >
                    <Text style={[styles.statusToggleBtnText, formStatus === 'active' && styles.statusToggleBtnTextActive]}>
                      Active (Open)
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.statusToggleBtn, formStatus === 'inactive' && styles.statusToggleBtnActiveRed]}
                    onPress={() => setFormStatus('inactive')}
                  >
                    <Text style={[styles.statusToggleBtnText, formStatus === 'inactive' && styles.statusToggleBtnTextActive]}>
                      In-active (Closed)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setPostModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitBtn, eventBusy && { opacity: 0.7 }]}
                onPress={handleSaveEvent}
                disabled={eventBusy}
              >
                {eventBusy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>
                    {editingEventId !== null ? 'Save Changes' : 'Publish Event'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 5. LEAVE REQUEST MODAL                                   */}
      {/* ======================================================== */}
      <Modal
        visible={leaveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalHeaderIconBox, { backgroundColor: '#FFEDD5' }]}>
                  <Calendar size={18} color="#EA580C" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Submit Leave / Holiday Request</Text>
                  <Text style={styles.modalSubtitle}>Direct submission to administrative office</Text>
                </View>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={() => setLeaveModalVisible(false)}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
            >
              <Text style={styles.formLabel}>LEAVE TYPE:</Text>
              <View style={styles.leaveTypeCapsulesRow}>
                {(['Casual Leave', 'Sick Leave', 'Earned Leave', 'Duty Leave'] as const).map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.leaveTypeCapsule, leaveType === t && styles.leaveTypeCapsuleActive]}
                    onPress={() => setLeaveType(t)}
                  >
                    <Text style={[styles.leaveTypeCapsuleText, leaveType === t && styles.leaveTypeCapsuleTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>START DATE (YYYY-MM-DD):</Text>
                <TextInput
                  value={leaveStartDate}
                  onChangeText={setLeaveStartDate}
                  placeholder="2026-10-22"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>END DATE (YYYY-MM-DD):</Text>
                <TextInput
                  value={leaveEndDate}
                  onChangeText={setLeaveEndDate}
                  placeholder="2026-10-23"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SUBSTITUTE / HANDOVER FACULTY:</Text>
                <TextInput
                  value={substituteTeacher}
                  onChangeText={setSubstituteTeacher}
                  placeholder="e.g. Mr. Sharma / Math Dept"
                  placeholderTextColor="#94A3B8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>REASON FOR APPLICATION:</Text>
                <TextInput
                  value={leaveReason}
                  onChangeText={setLeaveReason}
                  placeholder="Provide brief reason for leave application..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.formInput, styles.formTextArea]}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setLeaveModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitBtn, { backgroundColor: '#EA580C' }, submittingLeave && { opacity: 0.7 }]}
                onPress={handleSubmitLeave}
                disabled={submittingLeave}
              >
                {submittingLeave ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Submit Application</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 6. READ MESSAGE / NOTIFICATION DETAIL MODAL              */}
      {/* ======================================================== */}
      <Modal
        visible={!!selectedMessage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Bell size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedMessage?.title || 'Notice Details'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedMessage?.sender ? `From: ${selectedMessage.sender} • ` : ''}
                    {selectedMessage?.date} {selectedMessage?.time ? `• ${selectedMessage.time}` : ''}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedMessage(null)}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
            >
              <View style={styles.modalMetaPillsRow}>
                <View style={[styles.statusBadge, selectedMessage?.status === 'Approved' ? styles.statusBadgeApproved : styles.statusBadgePending]}>
                  <Text style={[styles.statusBadgeText, selectedMessage?.status === 'Approved' ? styles.statusBadgeTextApproved : styles.statusBadgeTextPending]}>
                    {selectedMessage?.status || 'Notice'}
                  </Text>
                </View>
                <View style={styles.readTag}>
                  <Check size={11} color="#10B981" />
                  <Text style={styles.readTagText}>Marked as Read</Text>
                </View>
              </View>

              <View style={styles.messageContentBox}>
                <Text style={styles.messageContentLabel}>MESSAGE CONTENT:</Text>
                <Text style={styles.messageContentBody}>
                  {selectedMessage?.body || 'No additional content provided.'}
                </Text>
              </View>

              {selectedMessage?.remarks && (
                <View style={styles.adminRemarksBox}>
                  <Text style={styles.adminRemarksLabel}>OFFICIAL REMARKS:</Text>
                  <Text style={styles.adminRemarksContent}>{selectedMessage.remarks}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  if (selectedMessage) {
                    markUnread(selectedMessage.rawId || selectedMessage.id);
                    setSelectedMessage(null);
                    onNotifAdded();
                  }
                }}
              >
                <Text style={styles.modalCancelBtnText}>Mark as Unread</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => setSelectedMessage(null)}
              >
                <Text style={styles.modalSubmitBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 28,
  },
  // 0. Segment Switcher
  segmentSwitcherCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
    backgroundColor: 'transparent',
  },
  segmentTabActive: {
    backgroundColor: '#EEF2FF',
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  badgeCount: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeCountActive: {
    backgroundColor: '#2563EB',
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeCountTextActive: {
    color: '#FFFFFF',
  },

  // 1. Top Banner Card
  topBannerCard: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  watermarkCircle1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  watermarkCircle2: {
    position: 'absolute',
    right: 20,
    bottom: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bannerContentRow: {
    gap: 14,
  },
  bannerLeftCol: {
    gap: 8,
  },
  bannerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishedEventsPill: {
    backgroundColor: 'rgba(30, 58, 138, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  publishedEventsPillText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  teacherViewPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  teacherViewPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#BFDBFE',
    lineHeight: 18,
  },
  postEventBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postEventBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  // 2. Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricCardActiveAll: {
    borderColor: '#8B5CF6',
    borderWidth: 1.5,
    backgroundColor: '#FBFBFE',
  },
  metricCardActiveGreen: {
    borderColor: '#10B981',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  metricCardActiveRed: {
    borderColor: '#F43F5E',
    borderWidth: 1.5,
    backgroundColor: '#FFF1F2',
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  purpleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  metricSubGray: {
    fontSize: 10,
    color: '#64748B',
  },
  metricSubGreen: {
    fontSize: 10,
    color: '#059669',
  },
  metricSubRed: {
    fontSize: 10,
    color: '#E11D48',
  },

  // 3. Filters & Search
  filterAndSearchRow: {
    gap: 10,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActiveAll: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  filterPillActiveGreen: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterPillInactiveGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterPillActiveRed: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterPillInactiveRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActiveAll: {
    color: '#FFFFFF',
  },
  filterPillTextWhite: {
    color: '#FFFFFF',
  },
  searchAndCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    paddingVertical: 0,
  },
  categoryDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    height: 38,
  },
  categoryDropdownTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryDropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  categoryDropdownItemText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  categoryDropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },

  // Event Cards
  eventsListContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schoolEventBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schoolEventBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillInactive: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  cardActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  eventDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  // Requests Tab
  tabContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    gap: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBoxPurple: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  markAllReadBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  markAllReadBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  markAllReadBtnTextDisabled: {
    color: '#94A3B8',
  },
  orangeSubmitBtn: {
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  orangeSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  refreshPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  refreshPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillsRowRequests: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterLeadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginRight: 4,
  },
  filterCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterCapsuleActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterCapsuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterCapsuleTextActive: {
    color: '#FFFFFF',
  },
  dashedEmptyBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyBellIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
  },
  requestsList: {
    gap: 10,
  },
  requestItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  requestItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  requestDateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextApproved: {
    color: '#16A34A',
  },
  statusBadgeTextPending: {
    color: '#D97706',
  },
  requestBodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  adminRemarksBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  adminRemarksLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  adminRemarksContent: {
    fontSize: 11,
    color: '#1E293B',
    marginTop: 2,
  },
  requestItemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  requestTitleTextUnread: {
    color: '#0F172A',
    fontWeight: '900',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  unreadTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  unreadTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  readTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
  },
  readTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tapToReadHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  quickMarkReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickMarkReadBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  quickMarkUnreadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  quickMarkUnreadBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  modalMetaPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  messageContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  messageContentLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  messageContentBody: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },

  // Broadcast Desk
  broadcastFormContainer: {
    gap: 12,
  },
  sendToRow: {
    gap: 6,
  },
  formRowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  sendToButtonsScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  audiencePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  audiencePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  audiencePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  audiencePillTextActive: {
    color: '#FFFFFF',
  },
  categoryDropdownContainer: {
    gap: 4,
  },
  categoryDropdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  categorySelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categorySelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownMenuFloating: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownMenuItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownMenuItemText: {
    fontSize: 12,
    color: '#475569',
  },
  dropdownMenuItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  amberClassBannerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    gap: 8,
  },
  amberBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amberBannerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  classSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  classSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  classDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  classDropdownItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  classDropdownItemActive: {
    backgroundColor: '#FEF3C7',
  },
  classDropdownItemText: {
    fontSize: 12,
    color: '#475569',
  },
  classDropdownItemTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  amberBannerSubtext: {
    fontSize: 10,
    color: '#B45309',
  },
  inputWrap: {
    gap: 4,
  },
  inputFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  broadcastTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#1E293B',
  },
  broadcastTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  publishBtnContainer: {
    alignItems: 'flex-end',
  },
  publishBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  publishBroadcastBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Modal common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollBody: {
    gap: 10,
    paddingVertical: 6,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1E293B',
  },
  formTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  formCategoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  formCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCategoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  formCategoryPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  formCategoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statusToggleBtnActiveGreen: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusToggleBtnActiveRed: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  statusToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusToggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  leaveTypeCapsulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  leaveTypeCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaveTypeCapsuleActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  leaveTypeCapsuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  leaveTypeCapsuleTextActive: {
    color: '#FFFFFF',
  },
});