import { useMemo, useState } from 'react';
import type { AttendanceRecord } from '../../../types/attendance';
import { apiGetAttendance } from '../../../services/schoolApi';
import { useEffect } from 'react';

/** Ward-scoped attendance + day/overall/subject/history derivations. */
export function useWardAttendance(selectedWardId: number | 'all', initialDate?: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(initialDate || '2026-10-15');

  const fetchAttendance = async () => {
    try {
      setRecords((await apiGetAttendance({})) || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const wardRecords = useMemo(
    () => (selectedWardId === 'all' ? records : records.filter((r) => r.studentId === selectedWardId)),
    [records, selectedWardId]
  );
  const dayRecords = useMemo(
    () => wardRecords.filter((r) => r.date === selectedDate).sort((a, b) => a.period - b.period),
    [wardRecords, selectedDate]
  );
  const overall = useMemo(() => {
    const total = wardRecords.length;
    const present = wardRecords.filter((r) => r.status === 'Present').length;
    const absent = wardRecords.filter((r) => r.status === 'Absent').length;
    const late = wardRecords.filter((r) => r.status === 'Late').length;
    return {
      total,
      present,
      absent,
      late,
      rate: total ? Math.round((present / total) * 100) : 0,
    };
  }, [wardRecords]);

  return { records, wardRecords, dayRecords, overall, loading, selectedDate, setSelectedDate, refetch: fetchAttendance };
}
