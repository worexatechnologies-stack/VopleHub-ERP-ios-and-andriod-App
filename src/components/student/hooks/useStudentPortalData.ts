import { useEffect, useState } from 'react';
import type { User } from '../../../types/auth';
import type { Student } from '../../../types/student';
import type { TimetableSlot } from '../../../types/academic';
import type { SchoolEvent, AppNotification } from '../../../types/communication';
import {
  apiGetStudent, apiGetTimetableSlots, apiGetStudentDocuments,
  apiGetEvents, apiGetNotifications, apiGetSubjects, apiGetStudentFeeSummary,
  apiGetExamSchedules, apiGetHallTicket, apiGetReportCards,
} from '../../../services/schoolApi';

/** One fetch for the whole student portal — mirrors web RoleDashboard student hooks. */
export function useStudentPortalData(currentUser: User) {
  const studentId = currentUser.studentId || 22;
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [feeSummary, setFeeSummary] = useState<any | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any | null>(null);
  const [reportCards, setReportCards] = useState<any[]>([]);

  const reloadDocs = async () => {
    try { setDocs(await apiGetStudentDocuments(studentId)); } catch {}
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [st, sl, dc, ev, nt, subs, fee, ex, cards] = await Promise.all([
          apiGetStudent(studentId).catch(() => null),
          apiGetTimetableSlots().catch(() => []),
          apiGetStudentDocuments(studentId).catch(() => []),
          apiGetEvents().catch(() => []),
          apiGetNotifications().catch(() => []),
          apiGetSubjects().catch(() => []),
          apiGetStudentFeeSummary(studentId).catch(() => null),
          apiGetExamSchedules().catch(() => []),
          apiGetReportCards(studentId).catch(() => []),
        ]);
        if (!alive) return;
        setStudent((st as Student | null) || null);
        setSlots((sl as TimetableSlot[]) || []);
        setDocs(dc || []);
        setEvents(ev || []);
        setNotifs(nt || []);
        setSubjects(subs || []);
        setFeeSummary(fee);
        setSchedules((ex as any[]) || []);
        setReportCards(cards || []);
        try {
          const first = ((ex as any[]) || [])[0];
          if (first) {
            const t = await apiGetHallTicket(first.id, studentId);
            if (alive) setTicket(t);
          }
        } catch {}
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const refetch = async () => {
    try {
      const [st, sl, dc, ev, nt, subs, fee, ex, cards] = await Promise.all([
        apiGetStudent(studentId).catch(() => null),
        apiGetTimetableSlots().catch(() => []),
        apiGetStudentDocuments(studentId).catch(() => []),
        apiGetEvents().catch(() => []),
        apiGetNotifications().catch(() => []),
        apiGetSubjects().catch(() => []),
        apiGetStudentFeeSummary(studentId).catch(() => null),
        apiGetExamSchedules().catch(() => []),
        apiGetReportCards(studentId).catch(() => []),
      ]);
      setStudent((st as Student | null) || null);
      setSlots((sl as TimetableSlot[]) || []);
      setDocs(dc || []);
      setEvents(ev || []);
      setNotifs(nt || []);
      setSubjects(subs || []);
      setFeeSummary(fee);
      setSchedules((ex as any[]) || []);
      setReportCards(cards || []);
    } catch {}
  };

  return {
    studentId, loading, student, slots, docs, reloadDocs,
    subjects, events, setEvents, notifs, feeSummary,
    schedules, ticket, reportCards, refetch,
  };
}
