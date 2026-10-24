export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-day';

export interface AttendanceRecord {
  id: number;
  schoolId: string;
  studentId: number;
  studentName?: string;
  rollNo?: string;
  className: string;
  sectionName: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Monday, etc.
  period: number; // 1 - 6
  subjectId: number;
  subjectName?: string;
  status: AttendanceStatus;
  reason?: string;
  markedByUserId: number;
  markedByName?: string;
  createdAt: string;
}

export interface AttendanceAuditLog {
  id: number;
  studentId: number;
  studentName?: string;
  date: string;
  dayOfWeek: string;
  period: number;
  previousStatus?: AttendanceStatus;
  newStatus: AttendanceStatus;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

export interface AttendancePeriodReport {
  period: number;
  timeLabel: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  halfDayCount: number;
  totalStudents: number;
  isEditable: boolean;
}

export interface AttendanceAnalytics {
  totalDbRecords: number;
  overallPercentage: number;
  dayOfWeekAnalysis: { day: string; percentage: number; count: number }[];
  subjectAnalysis: { subject: string; percentage: number }[];
  periodAnalysis: { period: number; percentage: number }[];
}

export interface AttendanceFilterParams {
  classId?: number;
  sectionId?: number;
  date?: string;
  studentId?: number;
  period?: number;
}
