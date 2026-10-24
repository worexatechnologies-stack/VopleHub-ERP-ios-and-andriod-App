import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { apiMarkNotificationRead, apiMarkAllNotificationsRead } from './schoolApi';

const STORAGE_KEY = '@volpehub_read_notifications_set';

export const DEFAULT_NOTIFICATIONS: any[] = [
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

// In-memory sets of read notification IDs and explicit unread overrides
const readIdSet = new Set<string>();
const unreadOverridesSet = new Set<string>();
const listeners = new Set<() => void>();
let initialized = false;

export function normalizeNotificationId(id: number | string | undefined | null): string | null {
  if (id === undefined || id === null) return null;
  return String(id).replace(/^(notif|leave)-/, '').trim();
}

// Load persisted read IDs on app start
async function initReadStore(): Promise<void> {
  if (initialized) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => {
          const norm = normalizeNotificationId(id);
          if (norm) readIdSet.add(norm);
        });
      }
    }
  } catch (err) {
    console.warn('[NotificationStore] Failed to load read notifications:', err);
  } finally {
    initialized = true;
    notifyListeners();
  }
}

// Kick off initial loading
initReadStore();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('[NotificationStore] Listener error:', e);
    }
  });
}

async function persistReadIds(): Promise<void> {
  try {
    const arr = Array.from(readIdSet);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.warn('[NotificationStore] Failed to persist read IDs:', err);
  }
}

/**
 * Format badge count for display in PortalSidebar and subtabs:
 * - 0 or negative -> undefined (badge is removed)
 * - 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 -> returns number
 * - > 10 -> returns '10+'
 */
export function formatBadgeCount(count: number): string | number | undefined {
  if (!count || count <= 0) return undefined;
  if (count > 10) return '10+';
  return count;
}

/**
 * Check if a notification item is read
 */
export function isNotificationRead(item: {
  id?: number | string;
  rawId?: number | string;
  readAt?: string | null;
  isRead?: boolean;
}): boolean {
  const norm = normalizeNotificationId(item.rawId) || normalizeNotificationId(item.id);
  if (norm && unreadOverridesSet.has(norm)) return false;
  if (norm && readIdSet.has(norm)) return true;
  if (item.readAt) return true;
  if (item.isRead === true) return true;
  return false;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: number | string): Promise<void> {
  const norm = normalizeNotificationId(id);
  if (norm) {
    readIdSet.add(norm);
    unreadOverridesSet.delete(norm);
    notifyListeners();
    persistReadIds();
  }

  const numId = Number(norm);
  if (!isNaN(numId) && numId > 0) {
    try {
      await apiMarkNotificationRead(numId);
    } catch {
      // Backend error ignored — local state already marked
    }
  }
}

/**
 * Mark a single notification as unread
 */
export async function markNotificationAsUnread(id: number | string): Promise<void> {
  const norm = normalizeNotificationId(id);
  if (norm) {
    readIdSet.delete(norm);
    unreadOverridesSet.add(norm);
    notifyListeners();
    persistReadIds();
  }
}

/**
 * Mark all given notifications (or all current) as read
 */
export async function markAllNotificationsAsRead(
  items?: Array<{ id?: number | string; rawId?: number | string }>
): Promise<void> {
  unreadOverridesSet.clear();
  if (items && items.length > 0) {
    items.forEach((item) => {
      const norm = normalizeNotificationId(item.rawId) || normalizeNotificationId(item.id);
      if (norm) {
        readIdSet.add(norm);
      }
    });
  }
  notifyListeners();
  persistReadIds();

  try {
    await apiMarkAllNotificationsRead();
  } catch {
    // Backend fallback
  }
}

/**
 * React hook for reading and updating notification read state across components
 */
export function useNotificationReadStore() {
  const [readVersion, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const markRead = useCallback((id: number | string) => {
    return markNotificationAsRead(id);
  }, []);

  const markUnread = useCallback((id: number | string) => {
    return markNotificationAsUnread(id);
  }, []);

  const markAllRead = useCallback(
    (items?: Array<{ id?: number | string; rawId?: number | string }>) => {
      return markAllNotificationsAsRead(items);
    },
    []
  );

  const checkIsRead = useCallback(
    (item: {
      id?: number | string;
      rawId?: number | string;
      readAt?: string | null;
      isRead?: boolean;
    }) => {
      return isNotificationRead(item);
    },
    [readVersion]
  );

  return {
    readVersion,
    readIdSet,
    markRead,
    markUnread,
    markAllRead,
    isRead: checkIsRead,
    formatBadge: formatBadgeCount,
  };
}
