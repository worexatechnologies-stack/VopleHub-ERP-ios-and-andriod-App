import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Info,
  Check,
} from 'lucide-react-native';
import { VolpeTheme } from '../../theme/theme';
import { EmptyState, SelectablePills } from '../common';
import type { AppNotification } from '../../types/communication';
import {
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiClearAllNotifications,
} from '../../services/schoolApi';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  isNotificationRead,
} from '../../services/notificationStore';
import { logger } from '../../utils/logger';
import { useAsyncEffect } from '../../utils/async';

// Module-level session cache — survives component remounts within the same app session.
// This prevents cleared/read notifications from reappearing when the panel is reopened.
let _sessionCache: AppNotification[] | null = null;
let _sessionCleared = false;

export function NotificationsView({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<AppNotification[]>(_sessionCache ?? []);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(_sessionCache === null && !_sessionCleared);

  useAsyncEffect((alive) => {
    // If we already have a session cache or user cleared all, skip the API/sample reload.
    if (_sessionCache !== null || _sessionCleared) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGetNotifications()
      .then((list) => {
        if (!alive()) return;
        if (list && list.length > 0) {
          _sessionCache = list;
          setItems(list);
        } else {
          const fallback: AppNotification[] = [
            {
              id: 101,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'School Admin', role: 'admin' },
              title: 'Term-1 Examination Schedules Released',
              body: 'Mid-term evaluation time tables and room allotments are now finalized. Please verify your assigned invigilation slots.',
              category: 'Exam' as const,
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              readAt: null,
            },
            {
              id: 102,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'Principal Office', role: 'admin' },
              title: 'Principal Office: Staff Council Briefing',
              body: 'All department heads and faculty members are requested to convene in the Auditorium at 3:30 PM for syllabus review.',
              category: 'General' as const,
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
              readAt: null,
            },
            {
              id: 103,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'Fee Office', role: 'admin' },
              title: 'Fee Due Clearance Cycle: Term 2',
              body: 'Second installment fee collection window is open. Receipts and pending ledger balance are updated in fee desks.',
              category: 'Fee' as const,
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              readAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
          ];
          _sessionCache = fallback;
          setItems(fallback);
        }
      })
      .catch(() => {
        if (!alive()) return;
        // Only use the hardcoded fallback if cache is still empty
        if (_sessionCache === null) {
          const fallback: AppNotification[] = [
            {
              id: 101,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'School Admin', role: 'admin' },
              title: 'Term-1 Examination Schedules Released',
              body: 'Mid-term evaluation time tables and room allotments are now finalized. Please verify your assigned invigilation slots.',
              category: 'Exam' as const,
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              readAt: null,
            },
            {
              id: 102,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'Principal Office', role: 'admin' },
              title: 'Principal Office: Staff Council Briefing',
              body: 'All department heads and faculty members are requested to convene in the Auditorium at 3:30 PM for syllabus review.',
              category: 'General' as const,
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
              readAt: null,
            },
            {
              id: 103,
              schoolId: 'local',
              channel: 'IN_APP' as const,
              sender: { id: 0, name: 'Fee Office', role: 'admin' },
              title: 'Fee Due Clearance Cycle: Term 2',
              body: 'Second installment fee collection window is open. Receipts and pending ledger balance are updated in fee desks.',
              category: 'Fee' as const,
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              readAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
          ];
          _sessionCache = fallback;
          setItems(fallback);
        }
      })
      .finally(() => {
        if (alive()) setLoading(false);
      });
  }, []);

  const markRead = async (id: number) => {
    try {
      markNotificationAsRead(id);
      setItems((prev) => {
        const next = prev.map((n: any) =>
          n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        );
        _sessionCache = next;
        return next;
      });
    } catch {
      logger.warn('mark notification read failed');
    }
  };

  const handleMarkAllRead = async () => {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, readAt: n.readAt || now }));
      _sessionCache = next; // persist read state across remounts
      return next;
    });
    try {
      await markAllNotificationsAsRead(items);
    } catch {
      logger.warn('mark all notifications read failed');
    }
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications from your desk?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            // Mark session as cleared — prevents sample data from reloading on remount
            _sessionCache = [];
            _sessionCleared = true;
            setItems([]);
            try {
              await apiClearAllNotifications();
            } catch {
              logger.warn('clear all notifications failed');
            }
          },
        },
      ]
    );
  };

  const unreadCount = items.filter((n: any) => !n.readAt).length;

  const filtered = items.filter((n: any) =>
    filter === 'all' ? true : n.category?.toLowerCase() === filter.toLowerCase()
  );

  const getCategoryIcon = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('exam')) return <FileText size={15} color="#4F46E5" />;
    if (cat.includes('fee')) return <CreditCard size={15} color="#059669" />;
    if (cat.includes('event')) return <Calendar size={15} color="#D97706" />;
    return <Info size={15} color="#2563EB" />;
  };

  return (
    <View style={s.wrap}>
      {/* 1. Website Portal Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={onClose} style={s.backBtn} hitSlop={8}>
            <ArrowLeft size={18} color="#0F172A" />
          </Pressable>
          <View>
            <View style={s.titleRow}>
              <Text style={s.title}>Notice Center</Text>
              {unreadCount > 0 ? (
                <View style={s.unreadPill}>
                  <Text style={s.unreadPillText}>{unreadCount} unread</Text>
                </View>
              ) : (
                <View style={s.allCaughtUpPill}>
                  <Check size={11} color="#059669" />
                  <Text style={s.allCaughtUpText}>Caught up</Text>
                </View>
              )}
            </View>
            <Text style={s.subtitle}>Official School Broadcasts & FCM Alerts</Text>
          </View>
        </View>
      </View>

      {/* 2. Actions Bar: Mark All Read & Clear All */}
      <View style={s.actionsBar}>
        <Text style={s.countLabel}>
          Showing {filtered.length} {filtered.length === 1 ? 'alert' : 'alerts'}
        </Text>
        <View style={s.actionButtonsGroup}>
          <Pressable
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={[s.actionBtn, unreadCount === 0 && s.actionBtnDisabled]}
            hitSlop={6}
          >
            <CheckCheck size={14} color={unreadCount === 0 ? '#94A3B8' : '#4F46E5'} />
            <Text
              style={[
                s.actionBtnText,
                unreadCount === 0 ? s.actionBtnTextDisabled : s.actionBtnTextPrimary,
              ]}
            >
              Mark all read
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClearAll}
            disabled={items.length === 0}
            style={[s.actionBtn, items.length === 0 && s.actionBtnDisabled]}
            hitSlop={6}
          >
            <Trash2 size={14} color={items.length === 0 ? '#94A3B8' : '#EF4444'} />
            <Text
              style={[
                s.actionBtnText,
                items.length === 0 ? s.actionBtnTextDisabled : s.actionBtnTextDanger,
              ]}
            >
              Clear all
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Category Filter Pills */}
      <View style={s.pillsRow}>
        <SelectablePills
          options={[
            { value: 'all', label: 'All Alerts' },
            { value: 'Exam', label: 'Exams' },
            { value: 'Fee', label: 'Fees' },
            { value: 'General', label: 'General' },
          ]}
          selected={filter}
          onSelect={setFilter}
        />
      </View>

      {/* 4. Notification List */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={s.loadingText}>Fetching school notices...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No Notifications"
              subtitle="You are all caught up! Academic alerts, schedule shifts, and announcements will appear here."
            />
          }
          renderItem={({ item }: any) => {
            const isUnread = !item.readAt;
            return (
              <Pressable
                onPress={() => markRead(item.id)}
                style={[s.card, isUnread && s.unreadCard]}
              >
                <View style={s.cardTopRow}>
                  <View style={s.catBadge}>
                    {getCategoryIcon(item.category)}
                    <Text style={s.catBadgeText}>
                      {(item.category || 'General').toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.topRightRow}>
                    {isUnread && (
                      <View style={s.unreadIndicatorBadge}>
                        <View style={s.unreadDot} />
                        <Text style={s.unreadLabel}>NEW</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={[s.titleText, isUnread && s.titleTextUnread]}>
                  {item.title}
                </Text>
                <Text style={s.bodyText}>{item.body}</Text>

                <View style={s.cardFooterRow}>
                  <Text style={s.metaText}>
                    Sender: {item.sender?.name || 'School Office'} ({item.sender?.role || 'Admin'})
                  </Text>
                  {isUnread ? (
                    <Text style={s.tapToMarkText}>Tap to mark read</Text>
                  ) : (
                    <View style={s.readConfirmedRow}>
                      <CheckCheck size={13} color="#2563EB" />
                      <Text style={s.readConfirmedText}>Read</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadPill: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  allCaughtUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  allCaughtUpText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnTextPrimary: {
    color: '#4F46E5',
  },
  actionBtnTextDanger: {
    color: '#EF4444',
  },
  actionBtnTextDisabled: {
    color: '#94A3B8',
  },
  pillsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  unreadCard: {
    borderColor: '#C7D2FE',
    backgroundColor: '#FAFCFF',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  unreadLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  titleTextUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  bodyText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaText: {
    fontSize: 10.5,
    color: '#94A3B8',
    flex: 1,
  },
  tapToMarkText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  readConfirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readConfirmedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
});
