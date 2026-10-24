import { useEffect, useState } from 'react';
import type { Student } from '../../../types/student';
import type { TimetableSlot } from '../../../types/academic';
import type { AppNotification, SchoolEvent } from '../../../types/communication';
import type { User } from '../../../types/auth';
import {
  apiGetStudents,
  apiGetTimetableSlots,
  apiGetNotifications,
  apiGetEvents,
} from '../../../services/schoolApi';
import { resolveActiveWard } from '../../../utils/academic';

/** Shared portal data: wards scoped to parentStudentIds + slots + notices + events. */
export function useParentPortalData(currentUser: User) {
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState<Student[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [stRes, sl, nt, ev] = await Promise.all([
          apiGetStudents().catch(() => ({ results: [] as Student[] })),
          apiGetTimetableSlots().catch(() => [] as TimetableSlot[]),
          apiGetNotifications().catch(() => [] as AppNotification[]),
          apiGetEvents().catch(() => [] as SchoolEvent[]),
        ]);
        if (!alive) return;
        let list: Student[] = (stRes as any).results || [];
        if (currentUser.parentStudentIds?.length) {
          const scoped = list.filter((s) => currentUser.parentStudentIds.includes(s.id));
          if (scoped.length > 0) list = scoped;
        }
        setWards(list);
        setSlots(sl || []);
        setNotifications(nt || []);
        setEvents(ev || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentUser.email, (currentUser.parentStudentIds || []).join(',')]);

  const refetch = async () => {
    try {
      const [stRes, sl, nt, ev] = await Promise.all([
        apiGetStudents().catch(() => ({ results: [] as Student[] })),
        apiGetTimetableSlots().catch(() => [] as TimetableSlot[]),
        apiGetNotifications().catch(() => [] as AppNotification[]),
        apiGetEvents().catch(() => [] as SchoolEvent[]),
      ]);
      let list: Student[] = (stRes as any).results || [];
      if (currentUser.parentStudentIds?.length) {
        const scoped = list.filter((s) => currentUser.parentStudentIds.includes(s.id));
        if (scoped.length > 0) list = scoped;
      }
      setWards(list);
      setSlots(sl || []);
      setNotifications(nt || []);
      setEvents(ev || []);
    } catch {}
  };

  return { loading, wards, slots, notifications, setNotifications, events, setEvents, refetch };
}

/** @deprecated Use shared `resolveActiveWard` from utils — kept for old imports. */
export { resolveActiveWard as useActiveWard };
