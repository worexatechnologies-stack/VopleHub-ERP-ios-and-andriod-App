import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Bell,
  Volume2,
  Filter,
  Search,
  Clock,
  RefreshCw,
  Megaphone,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import { useParentNotices } from '../hooks/useParentNotices';

interface ParentNoticesTabProps {
  wards?: Student[];
  selectedWardId?: number | 'all';
  onSelectWard?: (id: number | 'all') => void;
}

const CATEGORIES = ['ALL', 'URGENT', 'MEETING', 'ACADEMIC', 'GENERAL'];

export function ParentNoticesTab({
  wards = [],
  selectedWardId = 301,
  onSelectWard,
}: ParentNoticesTabProps) {
  const { items, updatedAt, reload, markRead } = useParentNotices();

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const wardName = activeWard?.name || 'ganesh';
  const admissionNo = (activeWard as any)?.admissionNo || 'ADM-202627-MV6A8C93';
  const className = (activeWard as any)?.className || 'Class 1';
  const sectionName = (activeWard as any)?.sectionName || 'A';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showChildPicker, setShowChildPicker] = useState(false);

  // Filter notices
  const filteredNotices = useMemo(() => {
    return items.filter((n) => {
      // Category filter
      const cat = (n.category || '').toUpperCase();
      let matchCat = true;
      if (selectedCategory === 'URGENT') {
        matchCat = cat === 'URGENT';
      } else if (selectedCategory === 'MEETING') {
        matchCat = cat === 'MEETING' || cat === 'GENERAL';
      } else if (selectedCategory === 'ACADEMIC') {
        matchCat = cat === 'ACADEMIC' || cat === 'EXAM';
      } else if (selectedCategory === 'GENERAL') {
        matchCat = cat === 'GENERAL' || cat === 'EVENT' || cat === 'MESSAGE';
      }

      // Search query
      const matchQuery =
        !searchQuery.trim() ||
        (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.body || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.sender?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [items, selectedCategory, searchQuery]);

  const unreadCount = items.filter((n) => !n.readAt).length;

  const handleHearSound = () => {
    Alert.alert(
      'Audio Notification',
      'Playing chime for latest official school notices.',
      [{ text: 'OK' }]
    );
  };

  const formatNoticeTime = (isoString?: string) => {
    if (!isoString) return 'Oct 15, 2026 at 12:00 PM';
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} at ${timePart}`;
    } catch {
      return isoString;
    }
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER CARD (1:1 with Screenshot)                 */}
      {/* ======================================================== */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          {/* Left Icon Box */}
          <View style={styles.bellIconBox}>
            <Bell size={24} color="#FFFFFF" />
          </View>

          {/* Title & Subtitle */}
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.portalPill}>
                <Text style={styles.portalPillText}>Parent Portal</Text>
              </View>
              <Text style={styles.announcementsLabel}>Official Announcements</Text>
            </View>

            <Text style={styles.headerTitle}>School Notices</Text>
            <Text style={styles.headerSubtitle}>
              Official circulars, class alerts, and school-wide announcements from your School Admin and teachers.
            </Text>
          </View>
        </View>

        {/* Right Controls Row (Child Selector, Unread Count, Hear Sound) */}
        <View style={styles.controlsRow}>
          {/* Select Child Dropdown */}
          <View style={styles.selectChildContainer}>
            <Text style={styles.selectChildLabel}>SELECT CHILD</Text>
            <Pressable
              style={styles.selectChildDropdown}
              onPress={() => setShowChildPicker(!showChildPicker)}
            >
              <Text style={styles.selectChildDropdownText}>
                {wardName} ({className} - {sectionName})
              </Text>
              <ChevronDown size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Unread Counter Box */}
          <View style={styles.unreadBox}>
            <Text style={styles.unreadNumber}>{unreadCount}</Text>
            <Text style={styles.unreadText}>UNREAD</Text>
          </View>

          {/* Hear Sound Button */}
          <Pressable style={styles.hearSoundBtn} onPress={handleHearSound}>
            <Volume2 size={15} color="#4F46E5" />
            <Text style={styles.hearSoundBtnText}>Hear Sound</Text>
          </Pressable>
        </View>

        {/* Inline Child Picker if tapped */}
        {showChildPicker && wards.length > 0 && (
          <View style={styles.childPickerMenu}>
            {wards.map((w) => {
              const isSelected = w.id === activeWard?.id;
              return (
                <Pressable
                  key={w.id}
                  style={[
                    styles.childPickerOption,
                    isSelected && styles.childPickerOptionActive,
                  ]}
                  onPress={() => {
                    onSelectWard?.(w.id);
                    setShowChildPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.childPickerOptionText,
                      isSelected && styles.childPickerOptionTextActive,
                    ]}
                  >
                    {w.name} ({w.className} - {w.sectionName || 'A'})
                  </Text>
                  {isSelected && <Check size={14} color="#4F46E5" />}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* ======================================================== */}
      {/* 2. CHILD FILTER ROW CARD (1:1 with Screenshot)           */}
      {/* ======================================================== */}
      <View style={styles.childFilterCard}>
        <View style={styles.childFilterRow}>
          <Filter size={15} color="#EF4444" />
          <Text style={styles.childFilterLabel}>CHILD:</Text>
          <View style={styles.activeChildPill}>
            <Text style={styles.activeChildPillText}>
              {wardName} {className}-{sectionName}
            </Text>
            <View style={styles.countCircleBadge}>
              <Text style={styles.countCircleBadgeText}>25</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. ACTIVE CHILD NOTICE SCOPE CARD (1:1 with Screenshot)  */}
      {/* ======================================================== */}
      <View style={styles.scopeCard}>
        <View style={styles.scopeRow}>
          {/* Avatar circle with initial G */}
          <View style={styles.scopeAvatarCircle}>
            <Text style={styles.scopeAvatarText}>
              {wardName.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Scope details */}
          <View style={{ flex: 1 }}>
            <View style={styles.scopeTitleRow}>
              <Text style={styles.scopeWardName}>{wardName}</Text>
              <View style={styles.scopeClassTag}>
                <Text style={styles.scopeClassTagText}>
                  Class {className} - Section {sectionName}
                </Text>
              </View>
              <Text style={styles.scopeAdmText}>Adm:  {admissionNo}</Text>
            </View>
            <Text style={styles.scopeSubtitle}>
              Showing notices targeted to {wardName}, Class {className}, and school-wide announcements
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. SEARCH & CATEGORY FILTER BAR (1:1 with Screenshot)    */}
      {/* ======================================================== */}
      <View style={styles.filterContainer}>
        <View style={styles.searchAndCatsRow}>
          {/* Search Input Box */}
          <View style={styles.searchBox}>
            <Search size={15} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notices & circulars..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter Pills */}
          <View style={styles.categoryPillsRow}>
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={[
                    styles.catPill,
                    isActive && styles.catPillActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      isActive && styles.catPillTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sync & Refresh Meta Row */}
        <View style={styles.syncRow}>
          <View style={styles.syncTimeBox}>
            <Clock size={13} color="#EF4444" />
            <Text style={styles.syncTimeText}>
              Updated {updatedAt || '2:42:59 PM'}
            </Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={() => reload(true)}>
            <RefreshCw size={13} color="#2563EB" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. NOTICES CARDS LIST (1:1 with Screenshot)              */}
      {/* ======================================================== */}
      <View style={styles.noticesList}>
        {filteredNotices.map((notice) => {
          const categoryTag = (notice.category || 'EVENT').toUpperCase();

          return (
            <View key={notice.id} style={styles.noticeCard}>
              {/* Tag Row: [EVENT] [📢 School-Wide Announcement] */}
              <View style={styles.noticeTagRow}>
                <View style={styles.noticeTypeTag}>
                  <Text style={styles.noticeTypeTagText}>{categoryTag}</Text>
                </View>

                <View style={styles.announcementTag}>
                  <Megaphone size={12} color="#64748B" />
                  <Text style={styles.announcementTagText}>
                    School-Wide Announcement
                  </Text>
                </View>
              </View>

              {/* Notice Title */}
              <Text style={styles.noticeTitle}>{notice.title}</Text>

              {/* Notice Body */}
              <Text style={styles.noticeBody}>{notice.body}</Text>

              {/* Notice Footer: Sender · Date */}
              <View style={styles.noticeFooterRow}>
                <Text style={styles.noticeSenderText}>
                  From {notice.sender?.name || 'School office'}
                </Text>
                <Text style={styles.noticeDot}>·</Text>
                <Calendar size={12} color="#64748B" />
                <Text style={styles.noticeDateText}>
                  {formatNoticeTime(notice.createdAt)}
                </Text>
              </View>
            </View>
          );
        })}

        {filteredNotices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={40} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Notices Found</Text>
            <Text style={styles.emptySubtitle}>
              No circulars or announcements matching the selected category filter.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 32,
  },

  // 1. Top Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  bellIconBox: {
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
    marginBottom: 4,
  },
  portalPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  portalPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  announcementsLabel: {
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

  // Controls Row (Child Dropdown, Unread Count, Hear Sound)
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    flexWrap: 'wrap',
  },
  selectChildContainer: {
    gap: 3,
  },
  selectChildLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  selectChildDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectChildDropdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadBox: {
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unreadNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0284C7',
  },
  unreadText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
  hearSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  hearSoundBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  childPickerMenu: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    gap: 4,
  },
  childPickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  childPickerOptionActive: {
    backgroundColor: '#EEF2FF',
  },
  childPickerOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  childPickerOptionTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // 2. Child Filter Row Card
  childFilterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  childFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  childFilterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  activeChildPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeChildPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countCircleBadge: {
    backgroundColor: '#B91C1C',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countCircleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // 3. Active Child Scope Card
  scopeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scopeAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scopeAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scopeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  scopeWardName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  scopeClassTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scopeClassTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  scopeAdmText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  scopeSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  // 4. Search & Filter Bar
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchAndCatsRow: {
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#0F172A',
    padding: 0,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  syncTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncTimeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },

  // 5. Notices List
  noticesList: {
    gap: 12,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  noticeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeTypeTag: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noticeTypeTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  announcementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  announcementTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  noticeBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  noticeFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  noticeSenderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  noticeDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  noticeDateText: {
    fontSize: 10,
    color: '#64748B',
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
});
