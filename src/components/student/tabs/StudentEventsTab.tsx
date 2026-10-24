import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  MapPin,
  Ticket,
  X,
  Sparkles,
  QrCode,
  Globe,
  Share2,
} from 'lucide-react-native';
import type { SchoolEvent } from '../../../types/communication';
import { apiRegisterEvent, apiGetEvents } from '../../../services/schoolApi';

interface StudentEventsTabProps {
  events?: SchoolEvent[];
  onChanged?: (e: SchoolEvent[]) => void;
  studentName?: string;
}

type EventFilter = 'all' | 'active' | 'inactive';

export function StudentEventsTab({
  events = [],
  onChanged,
  studentName = 'ganesh',
}: StudentEventsTabProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedPassEvent, setSelectedPassEvent] = useState<SchoolEvent | null>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  // Published events matching web portal (only Published status events)
  const publishedEvents = useMemo(() => {
    return (events || []).filter(
      (e) => (e.status || 'Published').toLowerCase() === 'published'
    );
  }, [events]);

  // Stat metrics
  const totalCount = publishedEvents.length;
  const activeCount = publishedEvents.filter(
    (e) => (e.activityStatus || 'active').toLowerCase() === 'active'
  ).length;
  const inactiveCount = totalCount - activeCount;

  // Filtered list
  const filteredEvents = useMemo(() => {
    return publishedEvents.filter((e) => {
      // Segment filter
      const isActive = (e.activityStatus || 'active').toLowerCase() === 'active';
      if (activeFilter === 'active' && !isActive) return false;
      if (activeFilter === 'inactive' && isActive) return false;

      // Category filter
      if (
        selectedCategory !== 'All Categories' &&
        e.kind?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (e.title || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [publishedEvents, activeFilter, selectedCategory, searchQuery]);

  const handleRegister = async (e: SchoolEvent) => {
    if (registeringId != null) return;
    setRegisteringId(e.id);
    try {
      await apiRegisterEvent(e.id, { attendee_name: studentName });
      const fresh = await apiGetEvents();
      if (onChanged) onChanged(fresh || []);
      Alert.alert(
        'Registration Confirmed!',
        `You are successfully registered for '${e.title}'. Your digital event pass is ready.`
      );
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err?.message || 'Could not complete registration. Please try again.'
      );
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP GRADIENT BANNER (1:1 with Web Screenshot)         */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        {/* Decorative Watermark Globe */}
        <View style={styles.watermarkGlobe}>
          <Globe size={110} color="rgba(255, 255, 255, 0.12)" />
        </View>

        {/* Badges Row */}
        <View style={styles.bannerBadgesRow}>
          <View style={styles.publishedBadge}>
            <Text style={styles.publishedBadgeText}>PUBLISHED EVENTS</Text>
          </View>
          <View style={styles.studentViewBadge}>
            <Text style={styles.studentViewBadgeText}>Student View</Text>
          </View>
        </View>

        {/* Banner Title & Subtitle */}
        <Text style={styles.bannerTitle}>School Events & Programs</Text>
        <Text style={styles.bannerSubtitle}>
          Browse published workshops, competitions, and seminars. Active events accept online
          registrations until their deadline.
        </Text>
      </View>

      {/* ======================================================== */}
      {/* 2. THREE STAT CARDS ROW (1:1 with Web Screenshot)        */}
      {/* ======================================================== */}
      <View style={styles.statsRow}>
        {/* Card 1: All Published Events */}
        <View style={styles.statCard}>
          <View style={styles.statIconBoxPurple}>
            <Calendar size={18} color="#6366F1" />
          </View>
          <View style={styles.statContentCol}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{totalCount}</Text>
            </View>
            <Text style={styles.statLabel}>All Published Events</Text>
            <Text style={styles.statSub}>Total scheduled programs</Text>
          </View>
        </View>

        {/* Card 2: Active Events */}
        <View style={styles.statCard}>
          <View style={styles.statIconBoxGreen}>
            <CheckCircle2 size={18} color="#10B981" />
          </View>
          <View style={styles.statContentCol}>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{activeCount}</Text>
            </View>
            <Text style={styles.statLabel}>Active Events</Text>
            <Text style={[styles.statSub, { color: '#10B981', fontWeight: '700' }]}>
              Registration is currently open
            </Text>
          </View>
        </View>

        {/* Card 3: In-active Events */}
        <View style={styles.statCard}>
          <View style={styles.statIconBoxRed}>
            <Clock size={18} color="#EF4444" />
          </View>
          <View style={styles.statContentCol}>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{inactiveCount}</Text>
            </View>
            <Text style={styles.statLabel}>In-active Events</Text>
            <Text style={[styles.statSub, { color: '#EF4444', fontWeight: '700' }]}>
              Deadline passed / Registration closed
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. SEGMENTED FILTER BUTTONS & SEARCH BAR ROW              */}
      {/* ======================================================== */}
      <View style={styles.filterSection}>
        {/* Segmented Filter Pills */}
        <View style={styles.filterPillsContainer}>
          <Pressable
            style={[
              styles.filterPillBtn,
              activeFilter === 'all' && styles.filterPillBtnActive,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All Events ({totalCount})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPillBtn,
              activeFilter === 'active' && styles.filterPillBtnActive,
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <View style={styles.greenDot} />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'active' && styles.filterPillTextActive,
              ]}
            >
              Active Events ({activeCount})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPillBtn,
              activeFilter === 'inactive' && styles.filterPillBtnActive,
            ]}
            onPress={() => setActiveFilter('inactive')}
          >
            <View style={styles.redDot} />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'inactive' && styles.filterPillTextActive,
              ]}
            >
              In-active Events ({inactiveCount})
            </Text>
          </Pressable>
        </View>

        {/* Search Input & Category Dropdown Row */}
        <View style={styles.searchCategoryRow}>
          <View style={styles.searchBox}>
            <Search size={14} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search published events..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Pressable
            style={styles.categoryDropdownBtn}
            onPress={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <Text style={styles.categoryDropdownText}>{selectedCategory}</Text>
            <ChevronDown size={14} color="#64748B" />
          </Pressable>
        </View>

        {showCategoryMenu && (
          <View style={styles.categoryMenu}>
            {['All Categories', 'School event', 'Workshop', 'Sports', 'Competition'].map(
              (cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryMenuItem,
                    selectedCategory === cat && styles.categoryMenuItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryMenuItemText,
                      selectedCategory === cat && styles.categoryMenuItemTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 4. EVENT CARDS LIST (1:1 with Dedate Screenshot)         */}
      {/* ======================================================== */}
      <View style={styles.eventsList}>
        {filteredEvents.map((e) => {
          const isActive = (e.activityStatus || 'active').toLowerCase() === 'active';
          const isRegistered = e.isRegistered || Boolean(e.ticketCode);
          const dateStr = e.dateTimeFormatted || 'Oct 22, 2026, 10:21 AM';
          const deadlineStr = e.registrationDeadline || 'Oct 20, 10:21 AM';

          return (
            <View key={e.id} style={styles.eventCard}>
              {/* Badges Row */}
              <View style={styles.eventBadgesRow}>
                {/* School Event Badge */}
                <View style={styles.schoolEventBadge}>
                  <Text style={styles.schoolEventBadgeText}>
                    {(e.kind || 'SCHOOL EVENT').toUpperCase()}
                  </Text>
                </View>

                {/* Active Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isActive ? '#10B981' : '#EF4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: isActive ? '#15803D' : '#DC2626' },
                    ]}
                  >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>

                {/* Golden Pass Badge */}
                {isRegistered && (
                  <Pressable
                    style={styles.passBadge}
                    onPress={() => setSelectedPassEvent(e)}
                  >
                    <Ticket size={11} color="#D97706" />
                    <Text style={styles.passBadgeText}>Pass</Text>
                  </Pressable>
                )}
              </View>

              {/* Event Title */}
              <Text style={styles.eventTitle}>{e.title}</Text>

              {/* Description */}
              <Text style={styles.eventDescription}>
                {e.description || 'Come in tradionals'}
              </Text>

              {/* Details Box */}
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Calendar size={14} color="#6366F1" />
                  <Text style={styles.detailText}>{dateStr}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={14} color="#0EA5E9" />
                  <Text style={styles.detailText}>{e.venue || 'Bangalore'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={14} color="#D97706" />
                  <Text style={styles.deadlineLabel}>Registration Deadline:</Text>
                  <Text style={styles.deadlineValue}>{deadlineStr}</Text>
                </View>
              </View>

              {/* Action: Pass Button or Register */}
              <View style={styles.eventCardFooter}>
                {isRegistered ? (
                  <Pressable
                    style={styles.viewPassBtn}
                    onPress={() => setSelectedPassEvent(e)}
                  >
                    <Ticket size={14} color="#4F46E5" />
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
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Sparkles size={14} color="#FFFFFF" />
                        <Text style={styles.registerBtnText}>Register for Event</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyCard}>
            <Calendar size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No events in this category</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or switching filters to see upcoming events.
            </Text>
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 5. OFFICIAL DIGITAL EVENT PASS MODAL                     */}
      {/* ======================================================== */}
      {selectedPassEvent && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPassEvent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.passModalCard}>
              {/* Header */}
              <View style={styles.passModalHeader}>
                <View style={styles.passHeaderLeft}>
                  <View style={styles.passIconBox}>
                    <Ticket size={18} color="#D97706" />
                  </View>
                  <View>
                    <Text style={styles.passModalTitle}>Official Entry Ticket Pass</Text>
                    <Text style={styles.passModalSubtitle}>
                      Authorized admission for {studentName}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setSelectedPassEvent(null)}
                >
                  <X size={18} color="#64748B" />
                </Pressable>
              </View>

              {/* Ticket Body */}
              <View style={styles.ticketBodyCard}>
                <View style={styles.ticketTopRow}>
                  <Text style={styles.ticketEventName}>{selectedPassEvent.title}</Text>
                  <View style={styles.confirmedPill}>
                    <Text style={styles.confirmedPillText}>CONFIRMED</Text>
                  </View>
                </View>

                <Text style={styles.ticketDescription}>
                  {selectedPassEvent.description || 'Come in tradionals'}
                </Text>

                <View style={styles.ticketInfoGrid}>
                  <View style={styles.ticketInfoItem}>
                    <Text style={styles.ticketInfoLabel}>DATE & TIME</Text>
                    <Text style={styles.ticketInfoValue}>
                      {selectedPassEvent.dateTimeFormatted || 'Oct 22, 2026, 10:21 AM'}
                    </Text>
                  </View>
                  <View style={styles.ticketInfoItem}>
                    <Text style={styles.ticketInfoLabel}>VENUE</Text>
                    <Text style={styles.ticketInfoValue}>
                      {selectedPassEvent.venue || 'Bangalore'}
                    </Text>
                  </View>
                  <View style={styles.ticketInfoItem}>
                    <Text style={styles.ticketInfoLabel}>ATTENDEE</Text>
                    <Text style={styles.ticketInfoValue}>{studentName} (Class 1-A)</Text>
                  </View>
                  <View style={styles.ticketInfoItem}>
                    <Text style={styles.ticketInfoLabel}>PASS CODE</Text>
                    <Text style={[styles.ticketInfoValue, { color: '#4F46E5', fontWeight: '900' }]}>
                      {selectedPassEvent.ticketCode || 'PASS-2026-DEDATE'}
                    </Text>
                  </View>
                </View>

                {/* QR Code Placeholder */}
                <View style={styles.qrContainer}>
                  <QrCode size={110} color="#0F172A" />
                  <Text style={styles.qrCodeText}>
                    {selectedPassEvent.ticketCode || 'PASS-2026-DEDATE'}
                  </Text>
                  <Text style={styles.qrSubtext}>
                    Scan at venue entrance gate for authorized admittance
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <Pressable
                style={styles.doneBtn}
                onPress={() => setSelectedPassEvent(null)}
              >
                <Text style={styles.doneBtnText}>Done</Text>
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
    gap: 16,
  },

  // 1. Top Gradient Banner
  bannerCard: {
    backgroundColor: '#3B49DF',
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3B49DF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  watermarkGlobe: {
    position: 'absolute',
    right: -15,
    top: -15,
    opacity: 0.8,
  },
  bannerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  publishedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  publishedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0E7FF',
    letterSpacing: 0.4,
  },
  studentViewBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  studentViewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    maxWidth: '92%',
  },

  // 2. Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBoxPurple: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBoxRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContentCol: {
    gap: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statSub: {
    fontSize: 9.5,
    color: '#64748B',
    lineHeight: 13,
  },

  // 3. Filter Section
  filterSection: {
    gap: 10,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  filterPillBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },

  searchCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  categoryDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  categoryDropdownText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  categoryMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    gap: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  categoryMenuItemText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  categoryMenuItemTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // 4. Events List
  eventsList: {
    gap: 14,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  eventBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  schoolEventBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  schoolEventBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D97706',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  eventDescription: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  deadlineLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  deadlineValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  eventCardFooter: {
    marginTop: 2,
  },
  viewPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    gap: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  registerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },

  // 5. Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  passModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  passModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  passModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBodyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ticketEventName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confirmedPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  ticketDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  ticketInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  ticketInfoItem: {
    width: '47%',
    gap: 2,
  },
  ticketInfoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  ticketInfoValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginTop: 4,
  },
  qrCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1,
    marginTop: 4,
  },
  qrSubtext: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 220,
  },
  doneBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
