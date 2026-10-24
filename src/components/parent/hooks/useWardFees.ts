import { useEffect, useState } from 'react';
import type { StudentFeeSummary } from '../../../types/fees';
import { apiGetStudentFeeSummary, apiRecordStudentPayment } from '../../../services/schoolApi';

/** Fee summary for active ward + pay-quarter flow with prior-quarter guard. */
export function useWardFees(studentId: number | undefined) {
  const [summary, setSummary] = useState<StudentFeeSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = async (id?: number) => {
    const sid = id ?? studentId;
    if (!sid) { setSummary(null); return; }
    setLoading(true);
    try {
      setSummary(await apiGetStudentFeeSummary(sid));
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!studentId) { setSummary(null); return; }
      setLoading(true);
      try {
        const s = await apiGetStudentFeeSummary(studentId);
        if (alive) setSummary(s);
      } catch {
        if (alive) setSummary(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [studentId]);

  return { summary, loading, reload };
}
