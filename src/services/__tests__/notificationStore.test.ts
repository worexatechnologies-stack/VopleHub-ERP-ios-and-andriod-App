jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('../schoolApi', () => ({
  apiMarkNotificationRead: jest.fn().mockResolvedValue({ success: true }),
  apiMarkAllNotificationsRead: jest.fn().mockResolvedValue({ success: true }),
}));

import {
  formatBadgeCount,
  isNotificationRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
} from '../notificationStore';

describe('NotificationStore & Badge Formatting', () => {
  describe('formatBadgeCount', () => {
    it('returns undefined for 0 or negative numbers', () => {
      expect(formatBadgeCount(0)).toBeUndefined();
      expect(formatBadgeCount(-1)).toBeUndefined();
    });

    it('returns exact number for counts from 1 to 10', () => {
      expect(formatBadgeCount(1)).toBe(1);
      expect(formatBadgeCount(2)).toBe(2);
      expect(formatBadgeCount(3)).toBe(3);
      expect(formatBadgeCount(9)).toBe(9);
      expect(formatBadgeCount(10)).toBe(10);
    });

    it('returns "10+" for counts greater than 10', () => {
      expect(formatBadgeCount(11)).toBe('10+');
      expect(formatBadgeCount(17)).toBe('10+');
      expect(formatBadgeCount(99)).toBe('10+');
    });
  });

  describe('isNotificationRead and marking read/unread', () => {
    it('recognizes items with readAt as read', () => {
      expect(isNotificationRead({ id: 101, readAt: '2026-10-23T10:00:00Z' })).toBe(true);
      expect(isNotificationRead({ id: 102, readAt: null })).toBe(false);
    });

    it('recognizes items with isRead=true as read', () => {
      expect(isNotificationRead({ id: 103, isRead: true })).toBe(true);
      expect(isNotificationRead({ id: 104, isRead: false })).toBe(false);
    });

    it('marks an unread item as read and unread', async () => {
      expect(isNotificationRead({ id: 999 })).toBe(false);
      await markNotificationAsRead(999);
      expect(isNotificationRead({ id: 999 })).toBe(true);
      expect(isNotificationRead({ rawId: 999 })).toBe(true);

      await markNotificationAsUnread(999);
      expect(isNotificationRead({ id: 999 })).toBe(false);
    });

    it('marks all notifications as read', async () => {
      const items = [{ id: 'notif-201' }, { id: 'notif-202' }, { id: 'leave-203' }];
      expect(isNotificationRead({ id: 'notif-201' })).toBe(false);
      expect(isNotificationRead({ id: 'notif-202' })).toBe(false);

      await markAllNotificationsAsRead(items);
      expect(isNotificationRead({ id: 'notif-201' })).toBe(true);
      expect(isNotificationRead({ id: 'notif-202' })).toBe(true);
      expect(isNotificationRead({ id: 'leave-203' })).toBe(true);
    });
  });
});
