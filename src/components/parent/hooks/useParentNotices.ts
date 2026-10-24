import { useEffect, useRef, useState } from 'react';
import type { AppNotification } from '../../../types/communication';
import { apiGetNotifications, apiMarkNotificationRead } from '../../../services/schoolApi';

/** Notices with 10s live poll + visibility refresh (matches web ParentNotifications). */
export function useParentNotices() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const aliveRef = useRef(true);

  const load = async (showLoading = true) => {
    try {
      const list = await apiGetNotifications();
      if (!aliveRef.current) return;
      setItems(list || []);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch {
      if (showLoading && aliveRef.current) setItems([]);
    }
  };

  useEffect(() => {
    aliveRef.current = true;
    load(true);
    const t = setInterval(() => load(false), 10000);
    return () => {
      aliveRef.current = false;
      clearInterval(t);
    };
  }, []);

  const markRead = async (id: number) => {
    try {
      await apiMarkNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch {}
  };

  return { items, updatedAt, reload: load, markRead };
}
