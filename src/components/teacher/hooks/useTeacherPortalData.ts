import { useEffect, useMemo, useState } from 'react';
import type { User } from '../../../types/auth';
import type { Student } from '../../../types/student';
import type { Teacher, TeachingAssignment } from '../../../types/teacher';
import type { TimetableSlot, Subject } from '../../../types/academic';
import type { ExamSchedule } from '../../../types/exams';
import type { SchoolEvent, AppNotification } from '../../../types/communication';
import {
  apiGetStudents, apiGetTimetableSlots, apiGetSubjects, apiGetTeachers,
  apiGetTeachingAssignments, apiGetTeacherDocuments, apiGetStaffSalaries,
  apiGetExamSchedules, apiGetTeacherLeaveRequests, apiGetEvents, apiGetNotifications,
} from '../../../services/schoolApi';
import { DEFAULT_NOTIFICATIONS } from '../../../services/notificationStore';

/** One fetch for the whole teacher portal — mirrors web RoleDashboard teacher hooks. */
export function useTeacherPortalData(currentUser: User) {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [teachersData, tas, subs, sl, stRes, sal, ex, ev, nt] = await Promise.all([
          apiGetTeachers().catch(() => []),
          apiGetTeachingAssignments().catch(() => []),
          apiGetSubjects().catch(() => []),
          apiGetTimetableSlots().catch(() => []),
          apiGetStudents().catch(() => ({ results: [] as Student[] })),
          apiGetStaffSalaries().catch(() => []),
          apiGetExamSchedules().catch(() => []),
          apiGetEvents().catch(() => []),
          apiGetNotifications().catch(() => []),
        ]);
        if (!alive) return;
        setTeachers(teachersData || []);
        const myTeacher = (teachersData || []).find(
          (t: Teacher) =>
            (currentUser.email && t.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
            (currentUser.name && t.name?.toLowerCase() === currentUser.name.toLowerCase()) ||
            ((currentUser as any).username && (t as any).username?.toLowerCase() === (currentUser as any).username.toLowerCase()) ||
            (currentUser.id && t.id === currentUser.id)
        ) || (teachersData || [])[0] || null;
        setTeacherProfile(myTeacher);
        setAssignments(tas || []);
        setSubjects(subs || []);
        setSlots(sl || []);
        setStudents(Array.isArray(stRes) ? stRes : ((stRes as any)?.results || (stRes as any)?.data || []));
        setSalaries(sal || []);
        setExams(ex || []);
        setEvents(ev || []);
        setNotifs(nt && nt.length > 0 ? nt : DEFAULT_NOTIFICATIONS);
        const tid = (myTeacher as Teacher | null)?.id || currentUser.id || 0;
        const [docsData, leaveData] = await Promise.all([
          tid ? apiGetTeacherDocuments(tid).catch(() => []) : Promise.resolve([]),
          tid ? apiGetTeacherLeaveRequests(tid).catch(() => []) : Promise.resolve([]),
        ]);
        if (!alive) return;
        setDocuments(docsData || []);
        setLeaveRequests(leaveData || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentUser.email, currentUser.id]);

  const refetch = async () => {
    try {
      const [teachersData, tas, subs, sl, stRes, sal, ex, ev, nt] = await Promise.all([
        apiGetTeachers().catch(() => []),
        apiGetTeachingAssignments().catch(() => []),
        apiGetSubjects().catch(() => []),
        apiGetTimetableSlots().catch(() => []),
        apiGetStudents().catch(() => ({ results: [] as Student[] })),
        apiGetStaffSalaries().catch(() => []),
        apiGetExamSchedules().catch(() => []),
        apiGetEvents().catch(() => []),
        apiGetNotifications().catch(() => []),
      ]);
      setTeachers(teachersData || []);
      const myTeacher = (teachersData || []).find(
        (t: Teacher) =>
          (currentUser.email && t.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.name && t.name?.toLowerCase() === currentUser.name.toLowerCase()) ||
          ((currentUser as any).username && (t as any).username?.toLowerCase() === (currentUser as any).username.toLowerCase()) ||
          (currentUser.id && t.id === currentUser.id)
      ) || (teachersData || [])[0] || null;
      setTeacherProfile(myTeacher);
      setAssignments(tas || []);
      setSubjects(subs || []);
      setSlots(sl || []);
      setStudents(Array.isArray(stRes) ? stRes : ((stRes as any)?.results || (stRes as any)?.data || []));
      setSalaries(sal || []);
      setExams(ex || []);
      setEvents(ev || []);
      setNotifs(nt && nt.length > 0 ? nt : DEFAULT_NOTIFICATIONS);
      const tid = (myTeacher as Teacher | null)?.id || currentUser.id || 0;
      const [docsData, leaveData] = await Promise.all([
        tid ? apiGetTeacherDocuments(tid).catch(() => []) : Promise.resolve([]),
        tid ? apiGetTeacherLeaveRequests(tid).catch(() => []) : Promise.resolve([]),
      ]);
      setDocuments(docsData || []);
      setLeaveRequests(leaveData || []);
    } catch {}
  };

  return {
    loading, teacherProfile, teachers, assignments, subjects, slots, students,
    salaries, documents, setDocuments, exams, events, setEvents,
    notifs, setNotifs, leaveRequests, setLeaveRequests, refetch,
  };
}

/** Assignment gate — timetable / attendance / marks only work after admin saves assignments. */
export function useAssignmentGate(assignments: TeachingAssignment[], userName?: string) {
  return useMemo(() => {
    const has = (assignments || []).length > 0;
    return { hasAssignments: has };
  }, [assignments, userName]);
}

/** Visible subjects for this teacher (replaces inline filter loops). */
export function useTeacherSubjects(subjects: Subject[], assignments: TeachingAssignment[]) {
  return useMemo(() => {
    const ids = new Set((assignments || []).map((a) => a.subjectId));
    return (subjects || []).filter((s) => ids.size === 0 || ids.has(s.id));
  }, [subjects, assignments]);
}

/** Today slots sorted by period. */
export function useTodaySlots(slots: TimetableSlot[], day: string) {
  return useMemo(
    () => (slots || []).filter((s) => s.day === day).sort((a, b) => a.period - b.period),
    [slots, day]
  );
}
