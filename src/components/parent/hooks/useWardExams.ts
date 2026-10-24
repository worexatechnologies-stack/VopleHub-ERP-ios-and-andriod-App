import { useEffect, useMemo, useState } from 'react';
import type { ExamSchedule, ReportCard, HallTicket } from '../../../types/exams';
import { apiGetExamSchedules, apiGetHallTicket, apiGetReportCards } from '../../../services/schoolApi';

/** Exam reports: published schedules only, ward-scoped cards + hall ticket. */
export function useWardExams(studentId: number | undefined) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [ticket, setTicket] = useState<HallTicket | null>(null);

  useEffect(() => {
    let alive = true;
    apiGetExamSchedules()
      .then((list) => {
        if (!alive) return;
        const pub = (list || []).filter((s) => s.status !== 'DRAFT');
        setSchedules(pub);
        if (pub.length && !selectedScheduleId) setSelectedScheduleId(pub[0].id);
      })
      .catch(() => alive && setSchedules([]));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!studentId) { setCards([]); return; }
    let alive = true;
    apiGetReportCards(studentId).then((c) => alive && setCards(c || [])).catch(() => alive && setCards([]));
    if (selectedScheduleId)
      apiGetHallTicket(selectedScheduleId, studentId).then((t) => alive && setTicket(t)).catch(() => alive && setTicket(null));
    else setTicket(null);
    return () => { alive = false; };
  }, [studentId, selectedScheduleId]);

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.id === selectedScheduleId),
    [schedules, selectedScheduleId]
  );
  const isPublished = !!selectedSchedule && selectedSchedule.reportCardsPublished !== false;

  return { schedules, selectedScheduleId, setSelectedScheduleId, selectedSchedule, isPublished, cards, ticket };
}
