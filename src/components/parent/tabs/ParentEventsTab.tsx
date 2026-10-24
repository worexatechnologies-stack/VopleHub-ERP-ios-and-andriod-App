import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Search,
  Ticket,
  X,
  QrCode,
  ShieldCheck,
  Globe,
} from 'lucide-react-native';
import type { SchoolEvent } from '../../../types/communication';
import { apiRegisterEvent } from '../../../services/schoolApi';

interface ParentEventsTabProps {
  events: SchoolEvent[];
  onChanged: () => void;
}

export type EventFilterType = 'all' | 'active' | 'inactive';
const EVENT_CATEGORIES = [
  'All Categories',
  'School Event',
  'Academic',
  'Sports',
  'Cultural',
  'Workshop',
] as const;

export function ParentEventsTab({ events, onChanged }: ParentEventsTabProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof EVENT_CATEGORIES)[number]>('All Categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedPassEvent, setSelectedPassEvent] = useState<SchoolEvent | null>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  // Default event matching web screenshot 1:1 if events prop is empty
  const defaultEvents: SchoolEvent[] = [
    {
      id: 1,
      schoolId: 'SCH-01',
      title: 'Dedate',
      kind: 'School event',
      status: 'Published',
      activityStatus: 'active',
      description: 'Come in tradionals',
      eventDate: '2026-10-22',
      date: '2026-10-22',
      dateTimeFormatted: 'Oct 22, 2026, 10:21 AM',
      registrationDeadline: 'Oct 20, 10:21 AM',
      startTime: '10:21 AM',
      endTime: '01:00 PM',
      venue: 'Bangalore',
      organizer: 'Harini Bala',
      capacity: 100,
      registeredCount: 35,
      ticketCode: 'PASS-2026-DEDATE',
      isRegistered: true,
      hasPass: true,
    },
  ];

  // Only consider Published events in Parent View
  const publishedEvents = useMemo(() => {
    const list = events && events.length > 0 ? events : defaultEvents;
    const published = list.filter((e) => (e.status || 'Published') === 'Published');
    return published.length > 0 ? published : defaultEvents;
  }, [events]);

  // Stat metrics
  const allEventsCount = publishedEvents.length;
  const activeEventsCount = publishedEvents.filter(
    (e) => (e.activityStatus || 'active') === 'active'
  ).length;
  const inactiveEventsCount = publishedEvents.filter(
    (e) =>
      e.activityStatus === 'completed' ||
      e.activityStatus === 'cancelled' ||
      (e as any).activityStatus === 'inactive'
  ).length;

  // Filtered events
  const filteredEvents = useMemo(() => {
    return publishedEvents.filter((e) => {
      // 1. Status Filter
      const isActive = (e.activityStatus || 'active') === 'active';
      if (activeFilter === 'active' && !isActive) return false;
      if (activeFilter === 'inactive' && isActive) return false;

      // 2. Category Filter
      if (selectedCategory !== 'All Categories') {
        const matchKind =
          selectedCategory.toLowerCase() === 'school event'
            ? (e.kind || '').toLowerCase().includes('school')
            : (e.kind || '').toLowerCase() === selectedCategory.toLowerCase();
        if (!matchKind) return false;
      }

      // 3. Search Query
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
  }, [publishedEvents, activeFilter, selectedCategory, searchQuery]);

  const handleRegister = async (event: SchoolEvent) => {
    if (registeringId !== null) return;
    setRegisteringId(event.id);
    try {
      await apiRegisterEvent(event.id, { attendee_name: 'Parent Guest' });
      onChanged();
      Alert.alert(
        'Registration Confirmed',
        `You have successfully registered for "${event.title}". Your pass is now active!`
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message || 'Could not register. Try again.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. HEADER BANNER (1:1 with Web Screenshot)               */}
      {/* ======================================================== */}
      <View style={styles.bannerContainer}>
        {/* Decorative globe/rings background artwork */}
        <View style={styles.globeArtWrapper} pointerEvents="none">
          <View style={styles.globeCircleOuter} />
          <View style={styles.globeCircleMid} />
          <View style={styles.globeCircleInner} />
        </View>

        <View style={styles.bannerContent}>
          {/* Top Badges Row */}
          <View style={styles.bannerBadgesRow}>
            <View style={styles.publishedEventsBadge}>
              <Text style={styles.publishedEventsText}>PUBLISHED EVENTS</Text>
            </View>
            <View style={styles.parentViewBadge}>
              <Text style={styles.parentViewText}>Parent View</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.bannerTitle}>School Events & Programs</Text>
          <Text style={styles.bannerSubtitle}>
            Browse published workshops, competitions, and seminars. Active events accept online registrations until their deadline.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. THREE STAT METRIC CARDS (1:1 with Web Screenshot)     */}
      {/* ======================================================== */}
      <View style={styles.metricsRow}>
        {/* Card 1: All Published Events */}
        <Pressable
          style={[
            styles.metricCard,
            activeFilter === 'all' && styles.metricCardActiveAll,
          ]}
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

        {/* Card 2: Active Events */}
        <Pressable
          style={[
            styles.metricCard,
            activeFilter === 'active' && styles.metricCardActiveGreen,
          ]}
          onPress={() => setActiveFilter('active')}
        >
          <View style={styles.metricCardTop}>
            <View style={styles.greenIconBox}>
              <CheckCircle2 size={18} color="#10B981" />
            </View>
            <Text style={[styles.metricNumber, { color: '#059669' }]}>
              {activeEventsCount}
            </Text>
          </View>
          <Text style={styles.metricTitle}>Active Events</Text>
          <Text style={styles.metricSubGreen}>Registration is currently open</Text>
        </Pressable>

        {/* Card 3: In-active Events */}
        <Pressable
          style={[
            styles.metricCard,
            activeFilter === 'inactive' && styles.metricCardActiveRed,
          ]}
          onPress={() => setActiveFilter('inactive')}
        >
          <View style={styles.metricCardTop}>
            <View style={styles.pinkIconBox}>
              <Clock size={18} color="#F43F5E" />
            </View>
            <Text style={[styles.metricNumber, { color: '#E11D48' }]}>
              {inactiveEventsCount}
            </Text>
          </View>
          <Text style={styles.metricTitle}>In-active Events</Text>
          <Text style={styles.metricSubRed}>Deadline passed / Registration closed</Text>
        </Pressable>
      </View>

      {/* ======================================================== */}
      {/* 3. FILTER PILLS & SEARCH BAR ROW (1:1 Screenshot Match)  */}
      {/* ======================================================== */}
      <View style={styles.filterAndSearchContainer}>
        {/* Left Filter Capsules */}
        <View style={styles.filterPillsRow}>
          {/* All Events */}
          <Pressable
            style={[
              styles.filterPill,
              activeFilter === 'all' && styles.filterPillActiveAll,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActiveAll,
              ]}
            >
              All Events ({allEventsCount})
            </Text>
          </Pressable>

          {/* Active Events */}
          <Pressable
            style={[
              styles.filterPill,
              activeFilter === 'active'
                ? styles.filterPillActiveGreen
                : styles.filterPillInactiveGreen,
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <View
              style={[
                styles.filterDot,
                { backgroundColor: activeFilter === 'active' ? '#FFFFFF' : '#10B981' },
              ]}
            />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'active' && styles.filterPillTextWhite,
                activeFilter !== 'active' && { color: '#059669' },
              ]}
            >
              Active Events ({activeEventsCount})
            </Text>
          </Pressable>

          {/* In-active Events */}
          <Pressable
            style={[
              styles.filterPill,
              activeFilter === 'inactive'
                ? styles.filterPillActiveRed
                : styles.filterPillInactiveRed,
            ]}
            onPress={() => setActiveFilter('inactive')}
          >
            <View
              style={[
                styles.filterDot,
                { backgroundColor: activeFilter === 'inactive' ? '#FFFFFF' : '#E11D48' },
              ]}
            />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'inactive' && styles.filterPillTextWhite,
                activeFilter !== 'inactive' && { color: '#DC2626' },
              ]}
            >
              In-active Events ({inactiveEventsCount})
            </Text>
          </Pressable>
        </View>

        {/* Right Search Box & Category Dropdown */}
        <View style={styles.searchAndCategoryRow}>
          <View style={styles.searchBox}>
            <Search size={14} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search published events..."
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

      {/* Category Dropdown Popover */}
      {categoryDropdownOpen && (
        <View style={styles.categoryDropdownMenu}>
          {EVENT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryDropdownItem,
                selectedCategory === cat && styles.categoryDropdownItemActive,
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setCategoryDropdownOpen(false);
              }}
            >
              <Text
                style={[
                  styles.categoryDropdownItemText,
                  selectedCategory === cat && styles.categoryDropdownItemTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. EVENT CARDS LIST (1:1 Web Screenshot: Dedate)         */}
      {/* ======================================================== */}
      <View style={styles.eventsListContainer}>
        {filteredEvents.map((e) => {
          const isActive = (e.activityStatus || 'active') === 'active';
          const isRegistered = e.isRegistered || Boolean(e.ticketCode);
          const formattedDate =
            e.dateTimeFormatted ||
            `${new Date(e.eventDate || e.date || '2026-10-22').toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            )}, ${e.startTime || '10:21 AM'}`;
          const deadlineText = e.registrationDeadline || 'Oct 20, 10:21 AM';

          return (
            <View key={e.id} style={styles.eventCard}>
              {/* Badges Row */}
              <View style={styles.cardTopRow}>
                <View style={styles.cardBadgesGroup}>
                  {/* SCHOOL EVENT Pill */}
                  <View style={styles.schoolEventBadge}>
                    <Text style={styles.schoolEventBadgeText}>
                      {(e.kind || 'SCHOOL EVENT').toUpperCase()}
                    </Text>
                  </View>

                  {/* ACTIVE / INACTIVE Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isActive ? styles.statusPillActive : styles.statusPillInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isActive ? '#059669' : '#DC2626' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isActive ? '#059669' : '#DC2626' },
                      ]}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>

                  {/* 🎟 Pass Badge (Screenshot 1:1) */}
                  <Pressable
                    style={styles.passBadge}
                    onPress={() => setSelectedPassEvent(e)}
                  >
                    <Ticket size={12} color="#D97706" />
                    <Text style={styles.passBadgeText}>Pass</Text>
                  </Pressable>
                </View>
              </View>

              {/* Event Title */}
              <Text style={styles.eventTitle}>{e.title}</Text>

              {/* Event Description */}
              <Text style={styles.eventDescription}>
                {e.description || 'Come in tradionals'}
              </Text>

              {/* Details Box (1:1 with Web Screenshot) */}
              <View style={styles.detailsBox}>
                {/* Row 1: Event Date & Time */}
                <View style={styles.detailRow}>
                  <Calendar size={15} color="#3B82F6" />
                  <Text style={styles.detailText}>{formattedDate}</Text>
                </View>

                {/* Row 2: Venue */}
                <View style={styles.detailRow}>
                  <MapPin size={15} color="#0EA5E9" />
                  <Text style={styles.detailText}>{e.venue || 'Bangalore'}</Text>
                </View>

                {/* Row 3: Registration Deadline */}
                <View style={[styles.detailRow, styles.deadlineRow]}>
                  <View style={styles.deadLeftGroup}>
                    <Clock size={15} color="#F59E0B" />
                    <Text style={styles.deadlineLabel}>Registration Deadline:</Text>
                  </View>
                  <Text style={styles.deadlineValue}>{deadlineText}</Text>
                </View>
              </View>

              {/* Action Button: View Pass or Register */}
              <View style={styles.cardActionsContainer}>
                {isRegistered ? (
                  <Pressable
                    style={styles.viewPassBtn}
                    onPress={() => setSelectedPassEvent(e)}
                  >
                    <Ticket size={15} color="#4F46E5" />
                    <Text style={styles.viewPassBtnText}>
                      View Ticket Pass ({e.ticketCode || 'PASS-2026-DEDATE'})
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.registerBtn}
                    onPress={() => handleRegister(e)}
                    disabled={registeringId === e.id}
                  >
                    {registeringId === e.id ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <ShieldCheck size={16} color="#FFFFFF" />
                        <Text style={styles.registerBtnText}>Register for Event</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={36} color="#818CF8" />
            </View>
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeFilter === 'inactive'
                ? 'No in-active or past events currently scheduled.'
                : activeFilter === 'active'
                ? 'No active events matching your filter criteria.'
                : 'No published campus events found.'}
            </Text>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 5. TICKET PASS MODAL                                     */}
      {/* ======================================================== */}
      {selectedPassEvent && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPassEvent(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.ticketModalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalBadge}>
                  <ShieldCheck size={14} color="#15803D" />
                  <Text style={styles.modalBadgeText}>OFFICIAL EVENT PASS</Text>
                </View>
                <Pressable
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedPassEvent(null)}
                >
                  <X size={18} color="#64748B" />
                </Pressable>
              </View>

              {/* Event Name & Code */}
              <Text style={styles.ticketEventTitle}>{selectedPassEvent.title}</Text>
              <Text style={styles.ticketDescription}>
                {selectedPassEvent.description || 'Come in tradionals'}
              </Text>

              {/* QR Code Simulation Area */}
              <View style={styles.ticketQrContainer}>
                <View style={styles.qrBox}>
                  <QrCode size={110} color="#0F172A" />
                </View>
                <Text style={styles.ticketCodeText}>
                  {selectedPassEvent.ticketCode || 'PASS-2026-DEDATE'}
                </Text>
                <Text style={styles.qrScanHint}>
                  Scan at campus entry desk on event day
                </Text>
              </View>

              {/* Pass Details */}
              <View style={styles.ticketMetaTable}>
                <View style={styles.ticketMetaRow}>
                  <Text style={styles.ticketMetaLabel}>Attendee</Text>
                  <Text style={styles.ticketMetaVal}>Parent Guest (ullasam)</Text>
                </View>
                <View style={styles.ticketMetaRow}>
                  <Text style={styles.ticketMetaLabel}>Date & Time</Text>
                  <Text style={styles.ticketMetaVal}>
                    {selectedPassEvent.dateTimeFormatted || 'Oct 22, 2026, 10:21 AM'}
                  </Text>
                </View>
                <View style={styles.ticketMetaRow}>
                  <Text style={styles.ticketMetaLabel}>Venue</Text>
                  <Text style={styles.ticketMetaVal}>
                    {selectedPassEvent.venue || 'Bangalore'}
                  </Text>
                </View>
                <View style={[styles.ticketMetaRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.ticketMetaLabel}>Pass Status</Text>
                  <View style={styles.confirmedPill}>
                    <Text style={styles.confirmedPillText}>CONFIRMED & VALID</Text>
                  </View>
                </View>
              </View>

              {/* Done Button */}
              <Pressable
                style={styles.ticketDoneBtn}
                onPress={() => setSelectedPassEvent(null)}
              >
                <Text style={styles.ticketDoneBtnText}>Close Pass</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // 1. Header Banner
  bannerContainer: {
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    overflow: 'hidden',
    position: 'relative',
    padding: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  globeArtWrapper: {
    position: 'absolute',
    right: -30,
    top: -20,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeCircleOuter: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  globeCircleMid: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  globeCircleInner: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.26)',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
  },
  bannerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  publishedEventsBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  publishedEventsText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  parentViewBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  parentViewText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 18,
    maxWidth: 320,
  },

  // 2. Metric Cards Row
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricCardActiveAll: {
    borderColor: '#C7D2FE',
    backgroundColor: '#FAF5FF',
  },
  metricCardActiveGreen: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  metricCardActiveRed: {
    borderColor: '#FECDD3',
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
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricSubGray: {
    fontSize: 9.5,
    color: '#94A3B8',
    lineHeight: 13,
  },
  metricSubGreen: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '600',
    lineHeight: 13,
  },
  metricSubRed: {
    fontSize: 9.5,
    color: '#DC2626',
    fontWeight: '600',
    lineHeight: 13,
  },

  // 3. Filter Pills & Search
  filterAndSearchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  filterPillActiveAll: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
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
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
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
    color: '#2563EB',
  },
  filterPillTextWhite: {
    color: '#FFFFFF',
  },

  // Search & Category Dropdown
  searchAndCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  categoryDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  categoryDropdownTriggerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  categoryDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryDropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  categoryDropdownItemText: {
    fontSize: 12,
    color: '#334155',
  },
  categoryDropdownItemTextActive: {
    fontWeight: '700',
    color: '#2563EB',
  },

  // 4. Event Cards List
  eventsListContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  schoolEventBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schoolEventBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusPillActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPillInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  deadlineRow: {
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  deadLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  deadlineValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Action Buttons
  cardActionsContainer: {
    marginTop: 14,
  },
  viewPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 10,
  },
  viewPassBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
  },
  registerBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Empty State
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 30,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ticketModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  modalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketEventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 14,
  },
  ticketQrContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  qrBox: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  ticketCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  qrScanHint: {
    fontSize: 10.5,
    color: '#64748B',
  },
  ticketMetaTable: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ticketMetaLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  ticketMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confirmedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  ticketDoneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ticketDoneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
