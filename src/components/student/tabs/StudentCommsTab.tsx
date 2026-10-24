import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  Bell,
  MessageSquare,
  BookOpen,
  Filter,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import type { AppNotification } from '../../../types/communication';
import { formatDate } from '../../../utils';

interface StudentCommsTabProps {
  notifs?: AppNotification[];
  onNavigateTab?: (tab: any) => void;
}

type NoticeFilter = 'All' | 'Urgent' | 'Notices';

export function StudentCommsTab({
  notifs = [],
  onNavigateTab,
}: StudentCommsTabProps) {
  const [activeFilter, setActiveFilter] = useState<NoticeFilter>('All');

  // Filter notices based on activeFilter and class notice category
  const filteredNotices = useMemo(() => {
    // Only notices and official announcements targeted for this student / class
    const classNotices = (notifs || []).filter((item) => {
      const cat = (item.category || '').toLowerCase();
      // Exclude 1-on-1 direct chat messages, event tickets, and fee receipts
      if (
        cat === 'message' ||
        cat === 'event' ||
        cat === 'fee'
      ) {
        return false;
      }
      // Must be a notice, class announcement, general bulletin, circular, or school broadcast
      const isNoticeType =
        cat === 'notice' ||
        cat === 'announcement' ||
        cat === 'general' ||
        cat === 'circular' ||
        cat === 'broadcast' ||
        cat === 'urgent' ||
        (item as any).type === 'notice';

      // If notice specifies another class (e.g. Class 10), don't show it for Class 1-A
      const notForOtherClass =
        !item.body?.includes('Class 10') && !item.title?.includes('Class 10');

      return isNoticeType && notForOtherClass;
    });

    return classNotices.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const priority = ((item as any).priority || '').toLowerCase();

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Urgent') {
        return (
          priority === 'high' ||
          priority === 'urgent' ||
          cat === 'urgent'
        );
      }
      if (activeFilter === 'Notices') {
        return (
          cat === 'notice' ||
          cat === 'announcement' ||
          cat === 'general' ||
          cat === 'circular' ||
          cat === 'broadcast' ||
          (item as any).type === 'notice'
        );
      }
      return true;
    });
  }, [notifs, activeFilter]);

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP BANNER CARD (1:1 with Web Screenshot)             */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        {/* Top Badges & Action Row */}
        <View style={styles.bannerTopRow}>
          <View style={styles.badgeRow}>
            <View style={styles.myClassBadge}>
              <MessageSquare size={13} color="#6366F1" />
              <Text style={styles.myClassBadgeText}>My class</Text>
            </View>
            <Text style={styles.coordinatorsText}>· Teachers and coordinators</Text>
          </View>

          {/* View Class Homework Button */}
          {onNavigateTab && (
            <Pressable
              style={styles.homeworkBtn}
              onPress={() => onNavigateTab('homework')}
            >
              <BookOpen size={13} color="#4F46E5" />
              <Text style={styles.homeworkBtnText}>View Class Homework →</Text>
            </Pressable>
          )}
        </View>

        {/* Banner Title & Subtitle */}
        <View style={styles.bannerTextCol}>
          <Text style={styles.bannerTitle}>Student Notice Center</Text>
          <Text style={styles.bannerSubtitle}>
            Read class notices, assignment reminders and school announcements in one place.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. MAIN CARD: Class Notices & School Announcements       */}
      {/* ======================================================== */}
      <View style={styles.mainCard}>
        {/* Header with Icon, Title & Filters */}
        <View style={styles.cardHeaderContainer}>
          <View style={styles.headerLeftRow}>
            <View style={styles.bellIconBox}>
              <Bell size={18} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardMainTitle}>
                Class Notices & School Announcements
              </Text>
              <Text style={styles.cardSubtitle}>
                Official class alerts, timetable changes and school announcements
              </Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <View style={styles.filterLabelBox}>
              <Filter size={11} color="#64748B" />
              <Text style={styles.filterLabel}>FILTER:</Text>
            </View>

            <View style={styles.filterPillsContainer}>
              {(['All', 'Urgent', 'Notices'] as NoticeFilter[]).map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    style={[
                      styles.filterPill,
                      isActive && styles.filterPillActive,
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive && styles.filterPillTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Dashed Box / Content Area */}
        {filteredNotices.length === 0 ? (
          <View style={styles.emptyDashedBox}>
            <View style={styles.emptyIconContainer}>
              <Bell size={42} color="#94A3B8" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No notices in this view</Text>
            <Text style={styles.emptySubtitle}>
              Incoming broadcasts and official announcements will appear here automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.noticesList}>
            {filteredNotices.map((item, index) => {
              const isUrgent =
                item.priority === 'HIGH' ||
                item.priority === 'URGENT' ||
                item.category === 'Urgent';
              return (
                <View key={item.id || index} style={styles.noticeCard}>
                  <View style={styles.noticeTopRow}>
                    <View style={styles.noticeTitleRow}>
                      <Text style={styles.noticeTitle}>{item.title}</Text>
                      {isUrgent && (
                        <View style={styles.urgentTag}>
                          <AlertCircle size={10} color="#DC2626" />
                          <Text style={styles.urgentTagText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.noticeDate}>
                      {item.createdAt ? formatDate(item.createdAt) : 'Recent'}
                    </Text>
                  </View>
                  <Text style={styles.noticeBody}>{item.body}</Text>
                  <View style={styles.noticeFooter}>
                    <Text style={styles.noticeSender}>
                      Posted by: {item.sender?.name || 'School Administration'}
                    </Text>
                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {item.category}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // 1. Top Banner Card
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
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  myClassBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.2,
  },
  coordinatorsText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  homeworkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  homeworkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  bannerTextCol: {
    gap: 3,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  // 2. Main Card
  mainCard: {
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
    gap: 16,
  },
  cardHeaderContainer: {
    gap: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  cardMainTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  // Filters Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  filterLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Dashed Empty Box
  emptyDashedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyIconContainer: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },

  // Notices List
  noticesList: {
    gap: 12,
  },
  noticeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  noticeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  noticeDate: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  noticeBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  noticeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  noticeSender: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
